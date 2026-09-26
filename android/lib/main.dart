import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'models/app_models.dart';
import 'theme/app_theme.dart';
import 'widgets/phone_mockup.dart';
import 'screens/splash_screen.dart';
import 'screens/home_screen.dart';
import 'screens/community_screen.dart';
import 'screens/ask_question_screen.dart';
import 'screens/analyzing_screen.dart';
import 'screens/question_sent_screen.dart';
import 'screens/question_detail_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/leaders_screen.dart';
import 'screens/knowledge_screen.dart';
import 'screens/panoramic_overview_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const KhataCopilotApp());
}

class KhataCopilotApp extends StatelessWidget {
  const KhataCopilotApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'KhataCopilot FranchiseOS',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const MainResponsiveShell(),
    );
  }
}

enum ViewMode {
  nativeResponsive,
  phoneSimulator,
  panoramicOverview,
}

class MainResponsiveShell extends StatefulWidget {
  const MainResponsiveShell({super.key});

  @override
  State<MainResponsiveShell> createState() => _MainResponsiveShellState();
}

class _MainResponsiveShellState extends State<MainResponsiveShell> {
  ScreenType _currentScreen = ScreenType.splash;
  int _bottomNavIndex = 0;
  ViewMode _viewMode = ViewMode.nativeResponsive;
  String _questionText = '';
  final List<ScreenType> _navHistory = [];
  DateTime? _lastBackPressTime;

  final List<Map<String, dynamic>> _screensMeta = [
    {'type': ScreenType.splash, 'label': '1. Splash', 'icon': Icons.storefront},
    {'type': ScreenType.home, 'label': '2. Home', 'icon': Icons.home_rounded},
    {'type': ScreenType.community, 'label': '3. Community', 'icon': Icons.forum_rounded},
    {'type': ScreenType.askQuestion, 'label': '4. Ask', 'icon': Icons.edit_note_rounded},
    {'type': ScreenType.analyzing, 'label': '5. AI Analyze', 'icon': Icons.auto_awesome},
    {'type': ScreenType.questionSent, 'label': '6. Sent Status', 'icon': Icons.check_circle_rounded},
    {'type': ScreenType.questionDetail, 'label': '7. Detail', 'icon': Icons.chat_bubble_rounded},
    {'type': ScreenType.profile, 'label': '8. Profile', 'icon': Icons.person_rounded},
    {'type': ScreenType.leaders, 'label': '9. Leaders', 'icon': Icons.emoji_events_rounded},
    {'type': ScreenType.knowledge, 'label': '10. Knowledge', 'icon': Icons.menu_book_rounded},
  ];

  void _navigateTo(ScreenType screen) {
    if (screen != _currentScreen) {
      _navHistory.add(_currentScreen);
    }
    setState(() {
      _currentScreen = screen;
      if (screen == ScreenType.home) _bottomNavIndex = 0;
      if (screen == ScreenType.community) _bottomNavIndex = 2;
      if (screen == ScreenType.knowledge) _bottomNavIndex = 3;
      if (screen == ScreenType.profile) _bottomNavIndex = 4;
    });
  }

  void _handleBackNavigation() {
    if (_navHistory.isNotEmpty) {
      final prevScreen = _navHistory.removeLast();
      setState(() {
        _currentScreen = prevScreen;
        if (prevScreen == ScreenType.home) _bottomNavIndex = 0;
        if (prevScreen == ScreenType.community) _bottomNavIndex = 2;
        if (prevScreen == ScreenType.knowledge) _bottomNavIndex = 3;
        if (prevScreen == ScreenType.profile) _bottomNavIndex = 4;
      });
      return;
    }

    if (_currentScreen != ScreenType.home) {
      setState(() {
        _currentScreen = ScreenType.home;
        _bottomNavIndex = 0;
      });
      return;
    }

    final now = DateTime.now();
    if (_lastBackPressTime == null || now.difference(_lastBackPressTime!) > const Duration(seconds: 2)) {
      _lastBackPressTime = now;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Press back again to exit KhataCopilot'),
          duration: Duration(seconds: 2),
        ),
      );
      return;
    }

    SystemNavigator.pop();
  }

  void _onBottomNavTapped(int index) {
    setState(() {
      _bottomNavIndex = index;
      switch (index) {
        case 0:
          _currentScreen = ScreenType.home;
          break;
        case 1:
          _currentScreen = ScreenType.home;
          break;
        case 2:
          _currentScreen = ScreenType.community;
          break;
        case 3:
          _currentScreen = ScreenType.knowledge;
          break;
        case 4:
          _currentScreen = ScreenType.profile;
          break;
      }
    });
  }

  Widget _buildScreenWidget(ScreenType type) {
    switch (type) {
      case ScreenType.splash:
        return SplashScreen(onNavigate: _navigateTo);
      case ScreenType.home:
        return HomeScreen(onNavigate: _navigateTo);
      case ScreenType.community:
        return CommunityScreen(onNavigate: _navigateTo);
      case ScreenType.askQuestion:
        return AskQuestionScreen(
          onNavigate: _navigateTo,
          questionText: _questionText,
          onQuestionChanged: (val) => setState(() => _questionText = val),
        );
      case ScreenType.analyzing:
        return AnalyzingScreen(onNavigate: _navigateTo);
      case ScreenType.questionSent:
        return QuestionSentScreen(onNavigate: _navigateTo);
      case ScreenType.questionDetail:
        return QuestionDetailScreen(onNavigate: _navigateTo);
      case ScreenType.profile:
        return ProfileScreen(onNavigate: _navigateTo);
      case ScreenType.leaders:
        return CommunityLeadersScreen(onNavigate: _navigateTo);
      case ScreenType.knowledge:
        return KnowledgeBaseScreen(onNavigate: _navigateTo);
    }
  }

  bool _shouldShowBottomNav(ScreenType screen) {
    return screen == ScreenType.home ||
        screen == ScreenType.community ||
        screen == ScreenType.profile ||
        screen == ScreenType.knowledge ||
        screen == ScreenType.leaders;
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        _handleBackNavigation();
      },
      child: _buildAdaptiveLayout(context),
    );
  }

  Widget _buildAdaptiveLayout(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = AppTheme.isDesktop(context);
    final isTablet = AppTheme.isTablet(context);

    // On native Android / Mobile APK, adapt purely based on device screen dimensions
    if (!kIsWeb) {
      if (screenWidth >= 720) {
        // Native Tablet / Large Foldable Android layout
        return Scaffold(
          backgroundColor: AppTheme.bgLight,
          body: Row(
            children: [
              if (_shouldShowBottomNav(_currentScreen))
                NavigationRail(
                  selectedIndex: _bottomNavIndex,
                  onDestinationSelected: _onBottomNavTapped,
                  labelType: NavigationRailLabelType.all,
                  selectedLabelTextStyle: const TextStyle(
                    color: AppTheme.primary,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                  unselectedLabelTextStyle: const TextStyle(
                    color: AppTheme.textSubtle,
                    fontSize: 11,
                  ),
                  destinations: const [
                    NavigationRailDestination(
                      icon: Icon(Icons.home_outlined),
                      selectedIcon: Icon(Icons.home_rounded),
                      label: Text('Home'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.menu_book_outlined),
                      selectedIcon: Icon(Icons.menu_book_rounded),
                      label: Text('Khata'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.forum_outlined),
                      selectedIcon: Icon(Icons.forum_rounded),
                      label: Text('Community'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.bar_chart_outlined),
                      selectedIcon: Icon(Icons.bar_chart_rounded),
                      label: Text('Reports'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.more_horiz_rounded),
                      selectedIcon: Icon(Icons.more_horiz_rounded),
                      label: Text('More'),
                    ),
                  ],
                ),
              Expanded(
                child: SafeArea(
                  child: Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 860),
                      child: _buildScreenWidget(_currentScreen),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      }

      // Native Smartphone Android layout
      return Scaffold(
        backgroundColor: AppTheme.bgLight,
        body: SafeArea(
          child: _buildScreenWidget(_currentScreen),
        ),
        bottomNavigationBar: _shouldShowBottomNav(_currentScreen)
            ? BottomNavigationBar(
                currentIndex: _bottomNavIndex,
                onTap: _onBottomNavTapped,
                type: BottomNavigationBarType.fixed,
                selectedItemColor: AppTheme.primary,
                unselectedItemColor: AppTheme.textSubtle,
                selectedFontSize: 11,
                unselectedFontSize: 11,
                backgroundColor: Colors.white,
                elevation: 8,
                items: const [
                  BottomNavigationBarItem(
                    icon: Icon(Icons.home_outlined),
                    activeIcon: Icon(Icons.home_rounded),
                    label: 'Home',
                  ),
                  BottomNavigationBarItem(
                    icon: Icon(Icons.menu_book_outlined),
                    activeIcon: Icon(Icons.menu_book_rounded),
                    label: 'Khata',
                  ),
                  BottomNavigationBarItem(
                    icon: Icon(Icons.forum_outlined),
                    activeIcon: Icon(Icons.forum_rounded),
                    label: 'Community',
                  ),
                  BottomNavigationBarItem(
                    icon: Icon(Icons.bar_chart_outlined),
                    activeIcon: Icon(Icons.bar_chart_rounded),
                    label: 'Reports',
                  ),
                  BottomNavigationBarItem(
                    icon: Icon(Icons.more_horiz_rounded),
                    activeIcon: Icon(Icons.more_horiz_rounded),
                    label: 'More',
                  ),
                ],
              )
            : null,
      );
    }

    // On Web (Desktop / Tablet view)
    if (isDesktop || isTablet) {
      return Scaffold(
        backgroundColor: const Color(0xFF090D16),
        appBar: AppBar(
          backgroundColor: const Color(0xFF0F172A),
          elevation: 0,
          toolbarHeight: 64,
          title: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF2563EB), Color(0xFF4F46E5)],
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Center(
                  child: Text(
                    'KC',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              const Flexible(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'KhataCopilot FranchiseOS',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w900,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      '10 Native Screens • Flutter Responsive',
                      style: TextStyle(color: Color(0xFF94A3B8), fontSize: 10),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
          actions: [
            // Responsive View Mode Switcher
            Container(
              margin: const EdgeInsets.symmetric(vertical: 12),
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _modeButton(
                    label: isDesktop ? 'Responsive' : 'Full',
                    icon: Icons.aspect_ratio_rounded,
                    isActive: _viewMode == ViewMode.nativeResponsive,
                    onTap: () => setState(() => _viewMode = ViewMode.nativeResponsive),
                  ),
                  _modeButton(
                    label: isDesktop ? 'Phone Frame' : 'Phone',
                    icon: Icons.phone_android_rounded,
                    isActive: _viewMode == ViewMode.phoneSimulator,
                    onTap: () => setState(() => _viewMode = ViewMode.phoneSimulator),
                  ),
                  _modeButton(
                    label: isDesktop ? '10-Screen Image Match' : '10 Screens',
                    icon: Icons.grid_view_rounded,
                    isActive: _viewMode == ViewMode.panoramicOverview,
                    onTap: () => setState(() => _viewMode = ViewMode.panoramicOverview),
                  ),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 20),
              tooltip: 'Reset to Splash Screen',
              onPressed: () => _navigateTo(ScreenType.splash),
            ),
            const SizedBox(width: 8),
          ],
        ),
        body: Column(
          children: [
            // Top Screen Switcher Ribbon
            Container(
              height: 48,
              color: const Color(0xFF0B0F19),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _screensMeta.length,
                separatorBuilder: (_, __) => const SizedBox(width: 6),
                itemBuilder: (context, index) {
                  final item = _screensMeta[index];
                  final isSelected = _currentScreen == item['type'];

                  return Center(
                    child: InkWell(
                      onTap: () {
                        _navigateTo(item['type']);
                        if (_viewMode == ViewMode.panoramicOverview) {
                          setState(() => _viewMode = ViewMode.nativeResponsive);
                        }
                      },
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFF1E3A8A) : const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isSelected ? AppTheme.primary : Colors.transparent,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              item['icon'],
                              size: 14,
                              color: isSelected ? const Color(0xFF93C5FD) : const Color(0xFF94A3B8),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              item['label'],
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),

            // Main Content Area
            Expanded(
              child: _buildDesktopBody(),
            ),
          ],
        ),
      );
    }

    // On standard Mobile screen (< 600px width)
    return Scaffold(
      backgroundColor: AppTheme.bgLight,
      body: SafeArea(
        child: _buildScreenWidget(_currentScreen),
      ),
      bottomNavigationBar: _shouldShowBottomNav(_currentScreen)
          ? BottomNavigationBar(
              currentIndex: _bottomNavIndex,
              onTap: _onBottomNavTapped,
              type: BottomNavigationBarType.fixed,
              selectedItemColor: AppTheme.primary,
              unselectedItemColor: AppTheme.textSubtle,
              selectedFontSize: 11,
              unselectedFontSize: 11,
              backgroundColor: Colors.white,
              elevation: 8,
              items: const [
                BottomNavigationBarItem(
                  icon: Icon(Icons.home_outlined),
                  activeIcon: Icon(Icons.home_rounded),
                  label: 'Home',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.menu_book_outlined),
                  activeIcon: Icon(Icons.menu_book_rounded),
                  label: 'Khata',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.forum_outlined),
                  activeIcon: Icon(Icons.forum_rounded),
                  label: 'Community',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.bar_chart_outlined),
                  activeIcon: Icon(Icons.bar_chart_rounded),
                  label: 'Reports',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.more_horiz_rounded),
                  activeIcon: Icon(Icons.more_horiz_rounded),
                  label: 'More',
                ),
              ],
            )
          : null,
    );
  }

  Widget _buildDesktopBody() {
    switch (_viewMode) {
      case ViewMode.panoramicOverview:
        return PanoramicOverviewScreen(
          onSelectScreen: (screen) {
            _navigateTo(screen);
            setState(() => _viewMode = ViewMode.phoneSimulator);
          },
          questionText: _questionText,
          onQuestionChanged: (val) => setState(() => _questionText = val),
        );

      case ViewMode.phoneSimulator:
        return Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(vertical: 24),
            child: PhoneMockupFrame(
              isSelected: true,
              child: Scaffold(
                backgroundColor: AppTheme.bgLight,
                body: SafeArea(
                  child: _buildScreenWidget(_currentScreen),
                ),
                bottomNavigationBar: _shouldShowBottomNav(_currentScreen)
                    ? BottomNavigationBar(
                        currentIndex: _bottomNavIndex,
                        onTap: _onBottomNavTapped,
                        type: BottomNavigationBarType.fixed,
                        selectedItemColor: AppTheme.primary,
                        unselectedItemColor: AppTheme.textSubtle,
                        selectedFontSize: 10,
                        unselectedFontSize: 10,
                        backgroundColor: Colors.white,
                        elevation: 4,
                        items: const [
                          BottomNavigationBarItem(
                            icon: Icon(Icons.home_outlined, size: 20),
                            label: 'Home',
                          ),
                          BottomNavigationBarItem(
                            icon: Icon(Icons.menu_book_outlined, size: 20),
                            label: 'Khata',
                          ),
                          BottomNavigationBarItem(
                            icon: Icon(Icons.forum_outlined, size: 20),
                            label: 'Community',
                          ),
                          BottomNavigationBarItem(
                            icon: Icon(Icons.bar_chart_outlined, size: 20),
                            label: 'Reports',
                          ),
                          BottomNavigationBarItem(
                            icon: Icon(Icons.more_horiz_rounded, size: 20),
                            label: 'More',
                          ),
                        ],
                      )
                    : null,
              ),
            ),
          ),
        );

      case ViewMode.nativeResponsive:
        return Container(
          color: AppTheme.bgLight,
          child: Row(
            children: [
              // Adaptive Navigation Rail
              if (_shouldShowBottomNav(_currentScreen))
                NavigationRail(
                  selectedIndex: _bottomNavIndex,
                  onDestinationSelected: _onBottomNavTapped,
                  labelType: NavigationRailLabelType.all,
                  selectedLabelTextStyle: const TextStyle(
                    color: AppTheme.primary,
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                  ),
                  unselectedLabelTextStyle: const TextStyle(
                    color: AppTheme.textSubtle,
                    fontSize: 11,
                  ),
                  destinations: const [
                    NavigationRailDestination(
                      icon: Icon(Icons.home_outlined),
                      selectedIcon: Icon(Icons.home_rounded),
                      label: Text('Home'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.menu_book_outlined),
                      selectedIcon: Icon(Icons.menu_book_rounded),
                      label: Text('Khata'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.forum_outlined),
                      selectedIcon: Icon(Icons.forum_rounded),
                      label: Text('Community'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.bar_chart_outlined),
                      selectedIcon: Icon(Icons.bar_chart_rounded),
                      label: Text('Reports'),
                    ),
                    NavigationRailDestination(
                      icon: Icon(Icons.more_horiz_rounded),
                      selectedIcon: Icon(Icons.more_horiz_rounded),
                      label: Text('More'),
                    ),
                  ],
                ),
              // Screen Body
              Expanded(
                child: SafeArea(
                  child: _buildScreenWidget(_currentScreen),
                ),
              ),
            ],
          ),
        );
    }
  }

  Widget _modeButton({
    required String label,
    required IconData icon,
    required bool isActive,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isActive ? AppTheme.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Icon(icon, size: 14, color: isActive ? Colors.white : const Color(0xFF94A3B8)),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: isActive ? Colors.white : const Color(0xFF94A3B8),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
