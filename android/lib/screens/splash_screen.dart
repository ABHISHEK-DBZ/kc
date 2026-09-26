import 'package:flutter/material.dart';
import '../models/app_models.dart';
import '../theme/app_theme.dart';
import '../widgets/auth_dialogs.dart';

class SplashScreen extends StatelessWidget {
  final Function(ScreenType) onNavigate;

  const SplashScreen({super.key, required this.onNavigate});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFF090D16),
            Color(0xFF0F172A),
            Color(0xFF070B14),
          ],
        ),
      ),
      child: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Brand Header
                  Column(
                    children: [
                      const SizedBox(height: 12),
                      Container(
                        width: 58,
                        height: 58,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF3B82F6), Color(0xFF4F46E5)],
                          ),
                          borderRadius: BorderRadius.circular(18),
                          boxShadow: [
                            BoxShadow(
                              color: AppTheme.primary.withValues(alpha: 0.3),
                              blurRadius: 15,
                              offset: const Offset(0, 6),
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.storefront_rounded,
                          color: Colors.white,
                          size: 32,
                        ),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'KhataCopilot',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const Text(
                        'FranchiseOS',
                        style: TextStyle(
                          color: Color(0xFF60A5FA),
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Manage • Support • Grow Together',
                        style: TextStyle(
                          color: Color(0xFF94A3B8),
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),

                  // 3D Isometric Center Illustration
                  Expanded(
                    child: Center(
                      child: AspectRatio(
                        aspectRatio: 1.1,
                        child: CustomPaint(
                          painter: IsometricStorePainter(),
                        ),
                      ),
                    ),
                  ),

                  // Bottom Action Buttons
                  Column(
                    children: [
                      // Sign In Button
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          onPressed: () {
                            AuthDialogs.showSignIn(
                              context,
                              onSuccess: () => onNavigate(ScreenType.home),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primary,
                            foregroundColor: Colors.white,
                            elevation: 8,
                            shadowColor: AppTheme.primary.withValues(alpha: 0.4),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          child: const Text(
                            'Sign In',
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),

                      // Create Account Button
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: OutlinedButton(
                          onPressed: () {
                            AuthDialogs.showSignUp(
                              context,
                              onSuccess: () => onNavigate(ScreenType.home),
                            );
                          },
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.white,
                            side: const BorderSide(color: Colors.white24, width: 1.5),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          child: const Text(
                            'Create Account',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 6),
                      TextButton(
                        onPressed: () => onNavigate(ScreenType.home),
                        child: const Text(
                          'Skip & Open Demo Dashboard →',
                          style: TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                        ),
                      ),

                      const Text(
                        'KhataCopilot Community • Support • Growth',
                        style: TextStyle(
                          color: Color(0xFF64748B),
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 6),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class IsometricStorePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;

    // Platform Base
    final basePaint = Paint()..color = const Color(0xFF1E293B).withValues(alpha: 0.8);
    final basePath = Path()
      ..moveTo(cx, cy + 80)
      ..lineTo(cx + 120, cy + 30)
      ..lineTo(cx, cy - 20)
      ..lineTo(cx - 120, cy + 30)
      ..close();
    canvas.drawPath(basePath, basePaint);

    // Left Wall
    final leftWallPaint = Paint()..color = const Color(0xFF1E3A8A);
    final leftWall = Path()
      ..moveTo(cx - 65, cy - 10)
      ..lineTo(cx, cy + 25)
      ..lineTo(cx, cy - 45)
      ..lineTo(cx - 65, cy - 80)
      ..close();
    canvas.drawPath(leftWall, leftWallPaint);

    // Right Wall
    final rightWallPaint = Paint()..color = const Color(0xFF0F172A);
    final rightWall = Path()
      ..moveTo(cx, cy + 25)
      ..lineTo(cx + 65, cy - 10)
      ..lineTo(cx + 65, cy - 80)
      ..lineTo(cx, cy - 45)
      ..close();
    canvas.drawPath(rightWall, rightWallPaint);

    // Roof Awning
    final roofPaint = Paint()..color = const Color(0xFF3B82F6);
    final roofPath = Path()
      ..moveTo(cx - 75, cy - 80)
      ..lineTo(cx, cy - 120)
      ..lineTo(cx + 75, cy - 80)
      ..lineTo(cx, cy - 40)
      ..close();
    canvas.drawPath(roofPath, roofPaint);

    // Floating Rupee Badge
    final badgePaint = Paint()..color = const Color(0xFF1E293B);
    final borderPaint = Paint()
      ..color = const Color(0xFF3B82F6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    final rupeeRect = RRect.fromRectAndRadius(
      Rect.fromCenter(center: Offset(cx + 70, cy - 30), width: 34, height: 34),
      const Radius.circular(8),
    );
    canvas.drawRRect(rupeeRect, badgePaint);
    canvas.drawRRect(rupeeRect, borderPaint);

    final textPainter = TextPainter(
      text: const TextSpan(
        text: '₹',
        style: TextStyle(
          color: Color(0xFF60A5FA),
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    textPainter.paint(canvas, Offset(cx + 64, cy - 41));

    // Floating Growth Chart Badge
    final chartRect = RRect.fromRectAndRadius(
      Rect.fromCenter(center: Offset(cx - 70, cy - 20), width: 38, height: 40),
      const Radius.circular(8),
    );
    final chartBorder = Paint()
      ..color = const Color(0xFF10B981)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    canvas.drawRRect(chartRect, badgePaint);
    canvas.drawRRect(chartRect, chartBorder);

    final chartLine = Paint()
      ..color = const Color(0xFF34D399)
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;
    final chartPath = Path()
      ..moveTo(cx - 82, cy - 10)
      ..lineTo(cx - 74, cy - 18)
      ..lineTo(cx - 66, cy - 14)
      ..lineTo(cx - 58, cy - 30);
    canvas.drawPath(chartPath, chartLine);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
