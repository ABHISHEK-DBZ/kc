import 'package:flutter/material.dart';
import '../models/app_models.dart';
import '../theme/app_theme.dart';
import '../services/app_state.dart';
import '../widgets/notifications_dialog.dart';
import '../widgets/auth_dialogs.dart';

class ProfileScreen extends StatelessWidget {
  final Function(ScreenType) onNavigate;

  const ProfileScreen({super.key, required this.onNavigate});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: AppState.instance,
      builder: (context, _) {
        final user = AppState.instance.user;
        final unreadCount = AppState.instance.notifications.where((n) => !n.isRead).length;

        return SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 700),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Profile Header Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(color: AppTheme.borderLight),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 26,
                              backgroundImage: NetworkImage(user.avatarUrl),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  user.name,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w900,
                                    color: AppTheme.textMain,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '${user.franchiseCode} • ${user.city} • ${user.role}',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w500,
                                    color: AppTheme.textMuted,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        IconButton(
                          icon: const Icon(Icons.settings_outlined, color: AppTheme.textMuted),
                          onPressed: () {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Franchise Settings & App Sync: All Online (Latency 18ms)'),
                                duration: Duration(seconds: 2),
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Section 1: Account Options
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: AppTheme.borderLight),
                    ),
                    child: Column(
                      children: [
                        _menuItem(
                          icon: Icons.person_outline_rounded,
                          title: 'My Profile & Rank',
                          onTap: () => onNavigate(ScreenType.leaders),
                        ),
                        _divider(),
                        _menuItem(
                          icon: Icons.storefront_outlined,
                          title: 'My Business Dashboard',
                          onTap: () => onNavigate(ScreenType.home),
                        ),
                        _divider(),
                        _menuItem(
                          icon: Icons.help_outline_rounded,
                          title: 'My Questions',
                          badge: '${user.questionsCount}',
                          onTap: () => onNavigate(ScreenType.community),
                        ),
                        _divider(),
                        _menuItem(
                          icon: Icons.chat_bubble_outline_rounded,
                          title: 'My Answers',
                          badge: '${user.answersCount}',
                          onTap: () => onNavigate(ScreenType.leaders),
                        ),
                        _divider(),
                        _menuItem(
                          icon: Icons.bookmark_border_rounded,
                          title: 'Saved Posts',
                          badge: '${user.savedPostsCount}',
                          onTap: () => onNavigate(ScreenType.community),
                        ),
                        _divider(),
                        _menuItem(
                          icon: Icons.notifications_none_rounded,
                          title: 'Notifications',
                          badge: unreadCount > 0 ? '$unreadCount New' : null,
                          onTap: () => NotificationsDialog.show(context),
                        ),
                        _divider(),
                        _menuItem(
                          icon: Icons.switch_account_outlined,
                          title: 'Switch Franchise Account',
                          onTap: () => AuthDialogs.showAccountSwitcher(context),
                        ),
                        _divider(),
                        _menuItem(
                          icon: Icons.logout_rounded,
                          title: 'Sign Out / Switch Store',
                          iconColor: AppTheme.roseDanger,
                          onTap: () => AuthDialogs.showSignIn(context),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),

              // Section 2: Community Navigation Group
              const Padding(
                padding: EdgeInsets.only(left: 4.0, bottom: 8.0),
                child: Text(
                  'Community',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.textMuted,
                    letterSpacing: 0.5,
                  ),
                ),
              ),

              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: AppTheme.borderLight),
                ),
                child: Column(
                  children: [
                    _menuItem(
                      icon: Icons.forum_outlined,
                      title: 'All Discussions',
                      iconColor: AppTheme.primary,
                      onTap: () => onNavigate(ScreenType.community),
                    ),
                    _divider(),
                    _menuItem(
                      icon: Icons.location_on_outlined,
                      title: 'My Region (Mumbai)',
                      iconColor: const Color(0xFF9333EA),
                      onTap: () => onNavigate(ScreenType.leaders),
                    ),
                    _divider(),
                    _menuItem(
                      icon: Icons.error_outline_rounded,
                      title: 'Unanswered',
                      iconColor: AppTheme.roseDanger,
                      onTap: () => onNavigate(ScreenType.community),
                    ),
                    _divider(),
                    _menuItem(
                      icon: Icons.check_circle_outline_rounded,
                      title: 'Solved',
                      iconColor: AppTheme.emeraldSuccess,
                      onTap: () => onNavigate(ScreenType.knowledge),
                    ),
                    _divider(),
                    _menuItem(
                      icon: Icons.campaign_outlined,
                      title: 'Announcements',
                      iconColor: AppTheme.amberWarning,
                      onTap: () => onNavigate(ScreenType.community),
                    ),
                    _divider(),
                    _menuItem(
                      icon: Icons.lightbulb_outline_rounded,
                      title: 'Feature Requests',
                      iconColor: const Color(0xFF4F46E5),
                      onTap: () => onNavigate(ScreenType.askQuestion),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
      },
    );
  }

  Widget _menuItem({
    required IconData icon,
    required String title,
    String? badge,
    Color? iconColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 12.0),
        child: Row(
          children: [
            Icon(icon, size: 20, color: iconColor ?? AppTheme.textMuted),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textMain,
                ),
              ),
            ),
            if (badge != null)
              Container(
                margin: const EdgeInsets.only(right: 6),
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  badge,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textMuted,
                  ),
                ),
              ),
            const Icon(Icons.chevron_right, size: 18, color: AppTheme.textSubtle),
          ],
        ),
      ),
    );
  }

  Widget _divider() {
    return const Divider(height: 1, indent: 46, color: Color(0xFFF8FAFC));
  }
}
