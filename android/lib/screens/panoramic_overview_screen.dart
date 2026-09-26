import 'package:flutter/material.dart';
import '../models/app_models.dart';
import '../widgets/phone_mockup.dart';
import 'splash_screen.dart';
import 'home_screen.dart';
import 'community_screen.dart';
import 'ask_question_screen.dart';
import 'analyzing_screen.dart';
import 'question_sent_screen.dart';
import 'question_detail_screen.dart';
import 'profile_screen.dart';
import 'leaders_screen.dart';
import 'knowledge_screen.dart';

class PanoramicOverviewScreen extends StatelessWidget {
  final Function(ScreenType) onSelectScreen;
  final String questionText;
  final Function(String) onQuestionChanged;

  const PanoramicOverviewScreen({
    super.key,
    required this.onSelectScreen,
    required this.questionText,
    required this.onQuestionChanged,
  });

  @override
  Widget build(BuildContext context) {
    final screens = [
      MapEntry('1. Splash / Welcome', SplashScreen(onNavigate: onSelectScreen)),
      MapEntry('2. Home Dashboard', HomeScreen(onNavigate: onSelectScreen)),
      MapEntry('3. Community Feed', CommunityScreen(onNavigate: onSelectScreen)),
      MapEntry(
        '4. Ask a Question',
        AskQuestionScreen(
          onNavigate: onSelectScreen,
          questionText: questionText,
          onQuestionChanged: onQuestionChanged,
        ),
      ),
      MapEntry('5. AI Analyzing', AnalyzingScreen(onNavigate: onSelectScreen)),
      MapEntry('6. Question Sent', QuestionSentScreen(onNavigate: onSelectScreen)),
      MapEntry('7. Question Detail', QuestionDetailScreen(onNavigate: onSelectScreen)),
      MapEntry('8. Profile & Menu', ProfileScreen(onNavigate: onSelectScreen)),
      MapEntry('9. Community Leaders', CommunityLeadersScreen(onNavigate: onSelectScreen)),
      MapEntry('10. Knowledge Base', KnowledgeBaseScreen(onNavigate: onSelectScreen)),
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
      child: Center(
        child: Column(
          children: [
            const Text(
              '10 Mobile Screens • KhataCopilot FranchiseOS',
              style: TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Pixel-perfect replica of the 10 screens from your attached design reference. Tap any screen to interact directly.',
              style: TextStyle(
                color: Color(0xFF94A3B8),
                fontSize: 12,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),

            // Responsive Wrap or Grid of Mockups
            Wrap(
              spacing: 24,
              runSpacing: 32,
              alignment: WrapAlignment.center,
              children: List.generate(screens.length, (index) {
                final entry = screens[index];
                final screenType = ScreenType.values[index];

                return PhoneMockupFrame(
                  title: entry.key,
                  onTap: () => onSelectScreen(screenType),
                  scale: 0.9,
                  child: entry.value,
                );
              }),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
