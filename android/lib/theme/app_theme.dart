import 'package:flutter/material.dart';

class AppTheme {
  // Brand Colors
  static const Color primary = Color(0xFF2563EB);
  static const Color primaryHover = Color(0xFF1D4ED8);
  static const Color primaryLight = Color(0xFFEFF6FF);
  
  static const Color bgDark = Color(0xFF090D16);
  static const Color bgDarkSurface = Color(0xFF0F172A);
  
  static const Color bgLight = Color(0xFFF8FAFC);
  static const Color cardWhite = Colors.white;
  
  static const Color textMain = Color(0xFF0F172A);
  static const Color textMuted = Color(0xFF64748B);
  static const Color textSubtle = Color(0xFF94A3B8);
  
  static const Color emeraldSuccess = Color(0xFF059669);
  static const Color emeraldLight = Color(0xFFECFDF5);
  
  static const Color amberWarning = Color(0xFFD97706);
  static const Color amberLight = Color(0xFFFFFBEB);
  
  static const Color roseDanger = Color(0xFFDC2626);
  static const Color roseLight = Color(0xFFFFF1F2);

  static const Color borderLight = Color(0xFFF1F5F9);
  static const Color borderMedium = Color(0xFFE2E8F0);

  // Responsive Breakpoints
  static const double mobileBreakpoint = 600;
  static const double tabletBreakpoint = 1024;

  static bool isMobile(BuildContext context) =>
      MediaQuery.of(context).size.width < mobileBreakpoint;

  static bool isTablet(BuildContext context) =>
      MediaQuery.of(context).size.width >= mobileBreakpoint &&
      MediaQuery.of(context).size.width < tabletBreakpoint;

  static bool isDesktop(BuildContext context) =>
      MediaQuery.of(context).size.width >= tabletBreakpoint;

  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    fontFamily: 'Inter',
    scaffoldBackgroundColor: bgLight,
    colorScheme: const ColorScheme.light(
      primary: primary,
      secondary: Color(0xFF4F46E5),
      surface: cardWhite,
      error: roseDanger,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: cardWhite,
      elevation: 0,
      centerTitle: false,
      iconTheme: IconThemeData(color: textMain),
      titleTextStyle: TextStyle(
        color: textMain,
        fontSize: 16,
        fontWeight: FontWeight.w800,
      ),
    ),
  );
}
