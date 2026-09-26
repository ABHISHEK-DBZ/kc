import 'package:flutter/material.dart';
import '../models/app_models.dart';
import '../theme/app_theme.dart';
import '../services/app_state.dart';

class QuestionSentScreen extends StatelessWidget {
  final Function(ScreenType) onNavigate;

  const QuestionSentScreen({super.key, required this.onNavigate});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: AppState.instance,
      builder: (context, _) {
        final activeId = AppState.instance.activeQuestionId;
        final steps = AppState.instance.pipelineSteps;

        return Scaffold(
          backgroundColor: AppTheme.bgLight,
          appBar: AppBar(
            leading: IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () => onNavigate(ScreenType.community),
            ),
          ),
          body: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 500),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: Column(
                  children: [
                    Expanded(
                      child: SingleChildScrollView(
                        child: Column(
                          children: [
                            const SizedBox(height: 12),
                            // Big Green Checkmark
                            Container(
                              width: 64,
                              height: 64,
                              decoration: BoxDecoration(
                                color: AppTheme.emeraldSuccess,
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: AppTheme.emeraldSuccess.withValues(alpha: 0.3),
                                    blurRadius: 16,
                                    offset: const Offset(0, 6),
                                  ),
                                ],
                              ),
                              child: const Icon(Icons.check_rounded, color: Colors.white, size: 36),
                            ),
                            const SizedBox(height: 14),

                            const Text(
                              'Your question has been posted!',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w900,
                                color: AppTheme.textMain,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Question #$activeId',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.textSubtle,
                              ),
                            ),
                            const SizedBox(height: 24),

                            // Real-time Stepper Timeline
                            Container(
                              padding: const EdgeInsets.all(20),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(24),
                                border: Border.all(color: AppTheme.borderLight),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.02),
                                    blurRadius: 10,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: Column(
                                children: [
                                  for (int i = 0; i < steps.length; i++) ...[
                                    _stepperRow(
                                      title: steps[i].label,
                                      timestamp: steps[i].timestamp,
                                      isDone: steps[i].status == 'completed',
                                      isInProgress: steps[i].status == 'in_progress',
                                      isPending: steps[i].status == 'pending',
                                    ),
                                    if (i < steps.length - 1) _stepperLine(),
                                  ],
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                // Action Buttons
                Column(
                  children: [
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        onPressed: () => onNavigate(ScreenType.questionDetail),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primary,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                          elevation: 4,
                        ),
                        child: const Text(
                          'View Question',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    SizedBox(
                      width: double.infinity,
                      height: 46,
                      child: OutlinedButton(
                        onPressed: () => onNavigate(ScreenType.community),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppTheme.textMain,
                          side: const BorderSide(color: AppTheme.borderMedium),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                        child: const Text(
                          'Back to Community',
                          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
      },
    );
  }

  Widget _stepperRow({
    required String title,
    required String timestamp,
    bool isDone = false,
    bool isInProgress = false,
    bool isPending = false,
  }) {
    return Row(
      children: [
        Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            color: isDone
                ? AppTheme.emeraldSuccess
                : isInProgress
                    ? AppTheme.primary
                    : const Color(0xFFF1F5F9),
            shape: BoxShape.circle,
            border: isPending
                ? Border.all(color: AppTheme.borderMedium, width: 1.5)
                : null,
          ),
          child: isDone
              ? const Icon(Icons.check, color: Colors.white, size: 14)
              : isInProgress
                  ? const Center(
                      child: SizedBox(
                        width: 8,
                        height: 8,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      ),
                    )
                  : const Center(
                      child: SizedBox(
                        width: 6,
                        height: 6,
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            color: AppTheme.textSubtle,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            title,
            style: TextStyle(
              fontSize: 12,
              fontWeight: isPending ? FontWeight.w500 : FontWeight.bold,
              color: isPending ? AppTheme.textSubtle : AppTheme.textMain,
            ),
          ),
        ),
        Text(
          timestamp,
          style: TextStyle(
            fontSize: 10,
            fontWeight: isInProgress ? FontWeight.bold : FontWeight.w500,
            color: isInProgress ? AppTheme.primary : AppTheme.textSubtle,
          ),
        ),
      ],
    );
  }

  Widget _stepperLine() {
    return Container(
      margin: const EdgeInsets.only(left: 11, top: 4, bottom: 4),
      width: 2,
      height: 18,
      color: const Color(0xFFE2E8F0),
    );
  }
}
