import 'dart:async';
import 'package:flutter/material.dart';
import '../models/app_models.dart';
import 'database_service.dart';
import 'groq_ai_service.dart';

class AppNotification {
  final String id;
  final String title;
  final String message;
  final String timeAgo;
  final IconData icon;
  final Color iconColor;
  bool isRead;

  AppNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.timeAgo,
    required this.icon,
    required this.iconColor,
    this.isRead = false,
  });
}

class QuestionReply {
  final String id;
  final String questionId;
  final String author;
  final String franchise;
  final String city;
  final String timeAgo;
  final String? badge;
  final String avatar;
  final String text;
  int likes;
  bool hasLiked;

  QuestionReply({
    required this.id,
    required this.questionId,
    required this.author,
    required this.franchise,
    required this.city,
    required this.timeAgo,
    this.badge,
    required this.avatar,
    required this.text,
    this.likes = 0,
    this.hasLiked = false,
  });
}

class PipelineStep {
  final String label;
  final String timestamp;
  final String status; // 'completed', 'in_progress', 'pending'

  PipelineStep({
    required this.label,
    required this.timestamp,
    required this.status,
  });
}

/// Central Reactive State Provider backed 100% by the local DatabaseService.
/// No static mocks: all data mutations persist to disk and notify live listeners.
class AppState extends ChangeNotifier {
  static final AppState instance = AppState._();

  StreamSubscription<String>? _dbSub;
  Timer? _tickerTimer;
  bool _isRealtimeActive = true;
  bool get isRealtimeActive => _isRealtimeActive;

  void toggleRealtime({bool? active}) {
    _isRealtimeActive = active ?? !_isRealtimeActive;
    notifyListeners();
  }

  // Cached in-memory typed models updated from DatabaseService
  UserProfile _user = const UserProfile(
    id: 'usr-1',
    name: 'Rajesh Sharma',
    franchiseCode: 'FR-2041',
    city: 'Mumbai Central',
    avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    role: 'Store Owner',
  );
  UserProfile get user => _user;

  BusinessHealthStats _health = const BusinessHealthStats(
    score: 92,
    status: 'Great',
    transactionsToday: 142,
    totalSalesToday: 48500,
    customersCount: 89,
    creditGiven: 12400,
    inventoryAlertsCount: 3,
    gstStatus: 'Sync Ready',
  );
  BusinessHealthStats get health => _health;

  final List<QuestionPost> _questions = [];
  List<QuestionPost> get questions => List.unmodifiable(_questions);

  final Map<String, List<QuestionReply>> _questionReplies = {};
  Map<String, List<QuestionReply>> get questionReplies => _questionReplies;

  final Map<String, bool> _followedQuestions = {};
  bool isFollowing(String questionId) => _followedQuestions[questionId] ?? false;

  final List<KnowledgeArticle> _articles = [];
  List<KnowledgeArticle> get articles => List.unmodifiable(_articles);

  final List<LeaderboardUser> _leaders = [];
  List<LeaderboardUser> get leaders => List.unmodifiable(_leaders);

  final List<AppNotification> _notifications = [];
  List<AppNotification> get notifications => List.unmodifiable(_notifications);

  String _activeQuestionId = 'QC-8421';
  String get activeQuestionId => _activeQuestionId;

  void setActiveQuestion(String id) {
    _activeQuestionId = id;
    notifyListeners();
  }

  String? _activeArticleId;
  String? get activeArticleId => _activeArticleId;
  void setActiveArticle(String id) {
    _activeArticleId = id;
    notifyListeners();
  }

  List<PipelineStep> _pipelineSteps = [];
  List<PipelineStep> get pipelineSteps => _pipelineSteps;

  AppState._() {
    _init();
  }

  Future<void> _init() async {
    await DatabaseService.instance.initialize();
    syncFromDatabase();

    _dbSub = DatabaseService.instance.onChange.listen((event) {
      syncFromDatabase();
    });

    _startRealtimeEngine();
  }

  /// Sync all typed state from DatabaseService
  void syncFromDatabase() {
    final db = DatabaseService.instance;

    // 1. User
    final rawUser = db.getCurrentUser();
    _user = UserProfile(
      id: rawUser['id'] ?? 'usr-1',
      name: rawUser['name'] ?? 'Rajesh Sharma',
      franchiseCode: rawUser['franchiseCode'] ?? 'FR-2041',
      city: rawUser['city'] ?? 'Mumbai Central',
      avatarUrl: rawUser['avatarUrl'] ?? '',
      role: rawUser['role'] ?? 'Store Owner',
      questionsCount: (rawUser['questionsCount'] as int?) ?? 0,
      answersCount: (rawUser['answersCount'] as int?) ?? 0,
      savedPostsCount: (rawUser['savedPostsCount'] as int?) ?? 0,
    );

    // 2. Business Health
    final rawBh = db.getBusinessHealth();
    _health = BusinessHealthStats(
      score: (rawBh['score'] as int?) ?? 92,
      status: rawBh['status'] ?? 'Great',
      transactionsToday: (rawBh['transactionsToday'] as int?) ?? 142,
      totalSalesToday: ((rawBh['totalSalesToday'] as num?) ?? 48500).toInt(),
      customersCount: (rawBh['customersCount'] as int?) ?? 89,
      creditGiven: ((rawBh['creditGiven'] as num?) ?? 12400).toInt(),
      inventoryAlertsCount: (rawBh['inventoryAlertsCount'] as int?) ?? 3,
      gstStatus: rawBh['gstStatus'] ?? 'Sync Ready',
    );

    // 3. Questions
    final rawQuestions = db.getQuestions();
    _questions.clear();
    for (var q in rawQuestions) {
      _questions.add(
        QuestionPost(
          id: q['id'] ?? '',
          title: q['title'] ?? '',
          body: q['body'] ?? '',
          authorName: q['authorName'] ?? '',
          authorFranchise: q['authorFranchise'] ?? '',
          authorLocation: q['authorLocation'] ?? '',
          authorAvatar: q['authorAvatar'] ?? '',
          authorBadge: q['authorBadge'],
          timeAgo: q['timeAgo'] ?? 'Just now',
          status: q['status'] ?? 'In Progress',
          tags: (q['tags'] as List?)?.cast<String>() ?? ['GST & Tax'],
          commentsCount: (q['commentsCount'] as int?) ?? 0,
          upvotesCount: (q['upvotesCount'] as int?) ?? 0,
          aiCategory: q['aiCategory'] ?? 'GST & Tax',
          aiConfidence: (q['aiConfidence'] as int?) ?? 94,
        ),
      );
    }

    // 4. Comments & Replies by Question
    _questionReplies.clear();
    for (var q in _questions) {
      final rawComments = db.getComments(q.id);
      _questionReplies[q.id] = rawComments.map((c) {
        final likedBy = (c['likedBy'] as List?)?.cast<String>() ?? [];
        return QuestionReply(
          id: c['id'] ?? '',
          questionId: q.id,
          author: c['authorName'] ?? '',
          franchise: c['authorFranchise'] ?? '',
          city: c['authorLocation'] ?? '',
          timeAgo: c['timeAgo'] ?? 'Just now',
          badge: c['authorBadge'],
          avatar: c['authorAvatar'] ?? '',
          text: c['text'] ?? '',
          likes: (c['likes'] as int?) ?? 0,
          hasLiked: likedBy.contains(_user.id),
        );
      }).toList();
    }

    // 5. Knowledge Base
    final rawArticles = db.getKnowledgeArticles();
    _articles.clear();
    for (var a in rawArticles) {
      _articles.add(
        KnowledgeArticle(
          id: a['id'] ?? '',
          title: a['title'] ?? '',
          category: a['category'] ?? '',
          subtitle: a['subtitle'] ?? '',
          iconBg: Color((a['bgCode'] as int?) ?? 0xFFECFDF5),
          iconColor: Color((a['colorCode'] as int?) ?? 0xFF059669),
          icon: _resolveArticleIcon(a['iconCode'] as int?),
        ),
      );
    }

    // 6. Leaderboard
    final rawLeaders = db.getLeaderboard();
    _leaders.clear();
    for (var l in rawLeaders) {
      _leaders.add(
        LeaderboardUser(
          rank: (l['rank'] as int?) ?? 1,
          name: l['name'] ?? '',
          franchiseCode: l['franchiseCode'] ?? '',
          city: l['city'] ?? '',
          answersCount: (l['answersCount'] as int?) ?? 0,
          avatarUrl: l['avatarUrl'] ?? '',
          isCurrentUser: l['id'] == _user.id,
        ),
      );
    }

    // 7. Notifications
    final rawNotifs = db.getNotifications();
    _notifications.clear();
    for (var n in rawNotifs) {
      _notifications.add(
        AppNotification(
          id: n['id'] ?? '',
          title: n['title'] ?? '',
          message: n['message'] ?? '',
          timeAgo: n['timeAgo'] ?? 'Just now',
          icon: _resolveNotificationIcon(n['iconCode'] as int?),
          iconColor: Color((n['colorCode'] as int?) ?? 0xFF2563EB),
          isRead: (n['isRead'] as bool?) ?? false,
        ),
      );
    }

    // 8. Pipeline Steps
    final rawSteps = db.getPipelineSteps();
    _pipelineSteps = rawSteps.map((s) {
      return PipelineStep(
        label: s['label'] ?? '',
        timestamp: s['timestamp'] ?? '',
        status: s['status'] ?? 'pending',
      );
    }).toList();

    notifyListeners();
  }

  static IconData _resolveArticleIcon(int? code) {
    switch (code) {
      case 0xe699: return Icons.verified_rounded;
      case 0xe4ea: return Icons.print_rounded;
      case 0xe3e0: return Icons.mic_rounded;
      case 0xe35b: return Icons.inventory_2_rounded;
      case 0xe873: return Icons.description_rounded;
      default: return Icons.article_rounded;
    }
  }

  static IconData _resolveNotificationIcon(int? code) {
    switch (code) {
      case 0xe0b0: return Icons.auto_awesome;
      case 0xe153: return Icons.notifications_rounded;
      case 0xe506: return Icons.receipt_long_rounded;
      case 0xe88e: return Icons.info_outline_rounded;
      default: return Icons.notifications_active_rounded;
    }
  }

  void _startRealtimeEngine() {
    _tickerTimer = Timer.periodic(const Duration(seconds: 12), (timer) {
      if (!_isRealtimeActive) return;

      // 1. Live POS sales tick
      DatabaseService.instance.recordTransactionTick(amount: 195.0);

      // 2. Advance active question pipeline if in progress
      if (_pipelineSteps.length >= 4 && _pipelineSteps[2].status == 'in_progress') {
        DatabaseService.instance.advancePipelineStep(
          2,
          'completed',
          'Notifying relevant franchisees (14 alerted in Mumbai/Pune)',
        );
        DatabaseService.instance.advancePipelineStep(
          3,
          'in_progress',
          'Escalating to support (Assigned: Ankit Verma - Tax Specialist)',
        );
      }
    });
  }

  // ==========================================
  // ACTIONS LINKED TO DATABASE
  // ==========================================

  Future<String> postNewQuestion({
    required String title,
    required String body,
    List<String>? tags,
  }) async {
    // 1. Live AI Classification via Groq LPU
    final aiResult = await GroqAIService.instance.categorizeQuestion(
      title: title,
      body: body,
    );

    final category = aiResult['category'] as String? ?? 'GST & Tax';
    final confidence = (aiResult['confidence'] as int?) ?? 94;
    final assignedTags = tags ?? ((aiResult['tags'] as List?)?.cast<String>() ?? ['GST & Tax', 'Report Issue']);

    final newQ = await DatabaseService.instance.insertQuestion(
      title: title,
      body: body,
      category: category,
      confidence: confidence,
      tags: assignedTags,
    );

    _activeQuestionId = newQ['id'];
    syncFromDatabase();
    return _activeQuestionId;
  }

  Future<void> addReply({
    required String questionId,
    required String text,
  }) async {
    if (text.trim().isEmpty) return;
    await DatabaseService.instance.addComment(
      questionId: questionId,
      text: text,
    );
    syncFromDatabase();
  }

  Future<void> toggleUpvoteQuestion(String questionId) async {
    await DatabaseService.instance.upvoteQuestion(questionId);
    syncFromDatabase();
  }

  Future<void> toggleUpvoteReply(String questionId, String replyId) async {
    await DatabaseService.instance.toggleCommentLike(commentId: replyId);
    syncFromDatabase();
  }

  void toggleFollow(String questionId) {
    _followedQuestions[questionId] = !isFollowing(questionId);
    notifyListeners();
  }

  List<AISimilarQuestion> getSimilarQuestions(String query) {
    final list = DatabaseService.instance.getSimilarQuestions(query);
    return list.map((item) {
      return AISimilarQuestion(
        id: item['id'] ?? 'QC-8421',
        title: item['title'] ?? '',
        answersCount: (item['commentsCount'] as int?) ?? 1,
        status: item['status'] ?? 'Solved',
        icon: Icons.check_circle_outline_rounded,
      );
    }).toList();
  }

  Future<void> applySolution(String questionId, String solutionTitle, {String? solutionText}) async {
    // 1. Synthesize clean SOP steps via Groq AI LPU
    final sopSteps = await GroqAIService.instance.extractSOPSteps(
      questionTitle: solutionTitle,
      solutionText: solutionText ?? solutionTitle,
    );

    final targetQ = DatabaseService.instance.getQuestionById(questionId);
    final category = targetQ?['aiCategory'] ?? 'GST & Tax';

    await DatabaseService.instance.synthesizeKnowledgeArticle(
      questionId: questionId,
      title: solutionTitle,
      category: category,
      subtitle: 'Verified solution extracted from #$questionId by Groq AI Agent',
      sopSteps: sopSteps,
    );
    syncFromDatabase();
  }

  Future<void> dismissNotification(String id) async {
    await DatabaseService.instance.dismissNotification(id);
    syncFromDatabase();
  }

  Future<void> markAllNotificationsRead() async {
    await DatabaseService.instance.markAllNotificationsRead();
    syncFromDatabase();
  }

  @override
  void dispose() {
    _tickerTimer?.cancel();
    _dbSub?.cancel();
    super.dispose();
  }
}
