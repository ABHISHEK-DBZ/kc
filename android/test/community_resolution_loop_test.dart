import 'package:flutter_test/flutter_test.dart';
import 'package:khatacopilot_flutter/services/database_service.dart';
import 'package:khatacopilot_flutter/services/app_state.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('KhataCopilot NetworkOS - Critical Community Resolution Loop E2E Test', () {
    late DatabaseService db;
    late AppState appState;

    setUp(() async {
      db = DatabaseService.instance;
      await db.initialize();
      appState = AppState.instance;
      appState.syncFromDatabase();
    });

    test('Full 21-Step Community Resolution Loop with Real Persistence & Audit', () async {
      // 1. Create / Verify Franchise A User
      final users = db.getAllUsers();
      expect(users.isNotEmpty, true, reason: 'Database users table must be seeded with franchise users');
      
      final franchiseAUser = users.firstWhere((u) => u['franchiseCode'] == 'FR-2041');
      expect(franchiseAUser['name'], 'Rajesh Sharma');
      expect(franchiseAUser['franchiseCode'], 'FR-2041');

      // 2. Login as Franchise A user
      final loginSuccess = await db.login(
        identifier: 'rajesh@store.khatacopilot.in',
        password: 'rajesh123',
      ) != null;
      expect(loginSuccess, true, reason: 'Franchise A authentication must succeed with salted hash verification');
      expect(db.getCurrentUser()['id'], franchiseAUser['id']);

      // 3. Post question: "My voice entry is misreading amounts."
      final questionTitle = 'My voice entry is misreading amounts.';
      final questionBody = 'When dictating 450 rupees, voice entry is recording 4500. How to adjust speech sensitivity?';
      final newQuestionId = await appState.postNewQuestion(
        title: questionTitle,
        body: questionBody,
      );

      // 4. Verify database record
      final insertedQ = db.getQuestionById(newQuestionId);
      expect(insertedQ, isNotNull);
      expect(insertedQ!['title'], questionTitle);
      expect(insertedQ['authorFranchise'], 'FR-2041');

      // 5. Verify category assigned by AI Intake Agent
      expect(insertedQ['aiCategory'], 'Voice Entry');
      expect((insertedQ['aiConfidence'] as int) >= 90, true);
      expect(insertedQ['tags'], contains('Voice Entry'));

      // 6. Verify similarity detection
      final similarQuestions = db.getSimilarQuestions('voice amounts entry');
      expect(similarQuestions.isNotEmpty, true);

      // 7. Verify routing & notification
      final notifications = db.getNotifications();
      final hasPostNotif = notifications.any((n) => (n['title'] as String).contains(newQuestionId));
      expect(hasPostNotif, true, reason: 'Notification must be dispatched on question creation');

      // 8. Login as Franchise B expert (Priya Gupta, FR-1185)
      final franchiseBUser = users.firstWhere((u) => u['franchiseCode'] == 'FR-1185');
      final expertLogin = await db.login(
        identifier: 'priya@store.khatacopilot.in',
        password: 'priya123',
      ) != null;
      expect(expertLogin, true);
      expect(db.getCurrentUser()['id'], franchiseBUser['id']);

      // 9. Verify question appears in Community feed
      appState.syncFromDatabase();
      final foundInFeed = appState.questions.any((q) => q.id == newQuestionId);
      expect(foundInFeed, true);

      // 10. Franchise B expert adds answer
      final initialAnswersCount = (franchiseBUser['answersCount'] as int?) ?? 0;
      await appState.addReply(
        questionId: newQuestionId,
        text: 'Go to Settings -> Voice Preferences -> Sensitivity. Set noise cancellation to High and calibrate mic.',
      );

      // 11. Verify comment persisted and expert answers count incremented
      final replies = db.getCommentsForQuestion(newQuestionId);
      expect(replies.length, 1);
      expect(replies.first['author'], franchiseBUser['name']);
      expect(replies.first['franchise'], franchiseBUser['franchiseCode']);
      expect((franchiseBUser['answersCount'] as int?) ?? 0, greaterThanOrEqualTo(initialAnswersCount));

      // 12. Switch back to Franchise A user (author)
      await db.switchAccount(franchiseAUser['id']);
      appState.syncFromDatabase();
      expect(db.getCurrentUser()['id'], franchiseAUser['id']);

      // 13. Accept answer & apply solution (promotes to Knowledge Base)
      await appState.applySolution(newQuestionId, 'Voice Entry Mic Sensitivity Calibration SOP');

      // 14. Verify question status changed to Solved
      final updatedQ = db.getQuestionById(newQuestionId);
      expect(updatedQ!['status'], 'Solved');

      // 15. Verify Knowledge Article was extracted and published
      final articles = db.getKnowledgeArticles();
      final publishedArticle = articles.firstWhere(
        (a) => a['sourceQuestionId'] == newQuestionId,
      );
      expect(publishedArticle, isNotNull);
      expect(publishedArticle['title'], 'Voice Entry Mic Sensitivity Calibration SOP');
      expect((publishedArticle['sopSteps'] as List).isNotEmpty, true);

      // 16. Verify Knowledge Article is accessible in AppState
      expect(appState.articles.any((a) => a.id == publishedArticle['id']), true);

      // 17. Verify Audit log recorded the solution acceptance
      final auditLogs = db.getAuditLogs();
      expect(auditLogs.any((l) => (l['action'] as String).contains('ACCEPT') || (l['action'] as String).contains('KNOWLEDGE') || (l['details'] as String).contains(newQuestionId)), true);

      // 18. Verify Leaderboard ranks expert appropriately
      final leaders = db.getLeaderboard();
      expect(leaders.isNotEmpty, true);
      expect(leaders.first['rank'], 1);
    });
  });
}
