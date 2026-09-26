import 'package:flutter/material.dart';
import '../models/app_models.dart';
import '../theme/app_theme.dart';
import '../services/app_state.dart';
import '../widgets/notifications_dialog.dart';
import '../widgets/auth_dialogs.dart';

class CommunityScreen extends StatefulWidget {
  final Function(ScreenType) onNavigate;

  const CommunityScreen({super.key, required this.onNavigate});

  @override
  State<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends State<CommunityScreen> {
  String _activeFilter = 'All';
  String _selectedCategoryId = 'all';
  bool _showAnnouncement = true;
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: AppState.instance,
      builder: (context, _) {
        final unreadCount = AppState.instance.notifications.where((n) => !n.isRead).length;
        final user = AppState.instance.user;
        final filteredQuestions = AppState.instance.questions.where((q) {
          if (_activeFilter == 'Unanswered' && (q.status == 'Solved' || q.status == 'Answered')) {
            return false;
          }
          if (_activeFilter == 'Solved' && q.status != 'Solved') return false;
          if (_activeFilter == 'Following' && !AppState.instance.isFollowing(q.id)) {
            return false;
          }
          if (_selectedCategoryId != 'all') {
            final catObj = AppCategories.all.firstWhere(
              (c) => c.id == _selectedCategoryId,
              orElse: () => AppCategories.all.first,
            );
            final match = q.aiCategory?.toLowerCase() == catObj.name.toLowerCase() ||
                q.tags.any((t) => t.toLowerCase() == catObj.name.toLowerCase());
            if (!match) return false;
          }
          if (_searchQuery.isNotEmpty &&
              !q.title.toLowerCase().contains(_searchQuery.toLowerCase()) &&
              !q.body.toLowerCase().contains(_searchQuery.toLowerCase())) {
            return false;
          }
          return true;
        }).toList();

        return Stack(
          children: [
            SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 800),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Community Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Community',
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.w900,
                                  color: AppTheme.textMain,
                                ),
                              ),
                              Text(
                                'Learn • Solve • Grow Together',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w500,
                                  color: AppTheme.textMuted,
                                ),
                              ),
                            ],
                          ),
                          Row(
                            children: [
                              // Sign In / Switch Account Pill
                              InkWell(
                                onTap: () => AuthDialogs.showAccountSwitcher(context),
                                borderRadius: BorderRadius.circular(20),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFEFF6FF),
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(color: const Color(0xFFBFDBFE)),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      CircleAvatar(
                                        radius: 9,
                                        backgroundImage: NetworkImage(user.avatarUrl),
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        user.franchiseCode,
                                        style: const TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.bold,
                                          color: AppTheme.primary,
                                        ),
                                      ),
                                      const SizedBox(width: 2),
                                      const Icon(Icons.arrow_drop_down, size: 14, color: AppTheme.primary),
                                    ],
                                  ),
                                ),
                              ),
                              const SizedBox(width: 4),
                              IconButton(
                                onPressed: () => NotificationsDialog.show(context),
                                icon: Stack(
                                  children: [
                                    const Icon(Icons.notifications_outlined, color: AppTheme.textMain),
                                    if (unreadCount > 0)
                                      Positioned(
                                        top: 2,
                                        right: 2,
                                        child: Container(
                                          width: 8,
                                          height: 8,
                                          decoration: const BoxDecoration(
                                            color: Colors.red,
                                            shape: BoxShape.circle,
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),

                  // Search Bar
                  Container(
                    height: 42,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppTheme.borderLight),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.02),
                          blurRadius: 10,
                        ),
                      ],
                    ),
                    child: TextField(
                      onChanged: (val) => setState(() => _searchQuery = val),
                      style: const TextStyle(fontSize: 12),
                      decoration: const InputDecoration(
                        hintText: 'Search questions, solutions...',
                        hintStyle: TextStyle(fontSize: 12, color: AppTheme.textSubtle),
                        prefixIcon: Icon(Icons.search, size: 18, color: AppTheme.textSubtle),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(vertical: 10),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Filter Pills Row
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: ['All', 'Unanswered', 'Solved', 'Following'].map((f) {
                        final isActive = _activeFilter == f;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: ChoiceChip(
                            label: Text(f),
                            selected: isActive,
                            onSelected: (_) => setState(() => _activeFilter = f),
                            selectedColor: AppTheme.primary,
                            labelStyle: TextStyle(
                              color: isActive ? Colors.white : AppTheme.textMuted,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                            backgroundColor: Colors.white,
                            side: BorderSide(
                              color: isActive ? AppTheme.primary : AppTheme.borderMedium,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Category Grid (Responsive Layout)
                  LayoutBuilder(
                    builder: (context, constraints) {
                      final cols = constraints.maxWidth > 500 ? 4 : 4;
                      return GridView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: cols,
                          crossAxisSpacing: 8,
                          mainAxisSpacing: 8,
                          childAspectRatio: 0.95,
                        ),
                        itemCount: AppCategories.all.length,
                        itemBuilder: (context, index) {
                          final cat = AppCategories.all[index];
                          final isSelected = _selectedCategoryId == cat.id;

                          return GestureDetector(
                            onTap: () => setState(() => _selectedCategoryId = cat.id),
                            child: Container(
                              decoration: BoxDecoration(
                                color: isSelected ? const Color(0xFFEFF6FF) : Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: isSelected ? AppTheme.primary : AppTheme.borderLight,
                                  width: isSelected ? 1.5 : 1,
                                ),
                              ),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Container(
                                    width: 32,
                                    height: 32,
                                    decoration: BoxDecoration(
                                      color: cat.bgColor,
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Icon(cat.icon, color: cat.color, size: 17),
                                  ),
                                  const SizedBox(height: 5),
                                  Text(
                                    cat.name,
                                    style: const TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w700,
                                      color: AppTheme.textMain,
                                    ),
                                    textAlign: TextAlign.center,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      );
                    },
                  ),
                  const SizedBox(height: 12),

                  // Announcement Card
                  if (_showAnnouncement)
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF1F2),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFFFE4E6)),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: AppTheme.roseDanger,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(Icons.campaign, color: Colors.white, size: 14),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFFE4E6),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: const Text(
                                    'ANNOUNCEMENT',
                                    style: TextStyle(
                                      color: AppTheme.roseDanger,
                                      fontSize: 9,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 3),
                                const Text(
                                  'New Feature: Auto GST Report',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.textMain,
                                  ),
                                ),
                                const Text(
                                  'GSTR-1 can now be generated directly from your sales. Watch tutorial here.',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: AppTheme.textMuted,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                            icon: const Icon(Icons.close, size: 16, color: Color(0xFFFB7185)),
                            onPressed: () => setState(() => _showAnnouncement = false),
                          ),
                        ],
                      ),
                    ),
                  const SizedBox(height: 12),

                  // Question Posts Feed
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: filteredQuestions.length,
                    itemBuilder: (context, index) {
                      final post = filteredQuestions[index];
                      return GestureDetector(
                        onTap: () {
                          AppState.instance.setActiveQuestion(post.id);
                          widget.onNavigate(ScreenType.questionDetail);
                        },
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(color: AppTheme.borderLight),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.02),
                                blurRadius: 10,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Author metadata row
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Row(
                                      children: [
                                        CircleAvatar(
                                          radius: 14,
                                          backgroundImage: NetworkImage(post.authorAvatar),
                                        ),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                post.authorName,
                                                style: const TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.bold,
                                                  color: AppTheme.textMain,
                                                ),
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                              Text(
                                                '${post.authorFranchise} • ${post.authorLocation} • ${post.timeAgo}',
                                                style: const TextStyle(
                                                  fontSize: 10,
                                                  color: AppTheme.textSubtle,
                                                ),
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: post.status == 'Unanswered'
                                          ? AppTheme.roseLight
                                          : post.status == 'Solved'
                                              ? AppTheme.emeraldLight
                                              : const Color(0xFFEFF6FF),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      post.status,
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.bold,
                                        color: post.status == 'Unanswered'
                                            ? AppTheme.roseDanger
                                            : post.status == 'Solved'
                                                ? AppTheme.emeraldSuccess
                                                : AppTheme.primary,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),

                              // Title & Body
                              Text(
                                post.title,
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w800,
                                  color: AppTheme.textMain,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                post.body,
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: AppTheme.textMuted,
                                  height: 1.3,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 8),

                              // Tags
                              Wrap(
                                spacing: 6,
                                runSpacing: 4,
                                children: post.tags.map((tag) {
                                  return Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFF1F5F9),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      tag,
                                      style: const TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w600,
                                        color: AppTheme.textMuted,
                                      ),
                                    ),
                                  );
                                }).toList(),
                              ),
                              const SizedBox(height: 10),

                              // Interactions
                              Row(
                                children: [
                                  const Icon(Icons.chat_bubble_outline_rounded,
                                      size: 14, color: AppTheme.textSubtle),
                                  const SizedBox(width: 4),
                                  Text(
                                    '${post.commentsCount}',
                                    style: const TextStyle(
                                        fontSize: 11, color: AppTheme.textSubtle),
                                  ),
                                  const SizedBox(width: 14),
                                  InkWell(
                                    onTap: () => AppState.instance.toggleUpvoteQuestion(post.id),
                                    child: Row(
                                      children: [
                                        const Icon(Icons.thumb_up_alt_outlined,
                                            size: 14, color: AppTheme.textSubtle),
                                        const SizedBox(width: 4),
                                        Text(
                                          '${post.upvotesCount}',
                                          style: const TextStyle(
                                              fontSize: 11, color: AppTheme.textSubtle),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 14),
                                  const Icon(Icons.share_outlined,
                                      size: 14, color: AppTheme.textSubtle),
                                  const SizedBox(width: 4),
                                  const Text(
                                    'Share',
                                    style: TextStyle(
                                        fontSize: 11, color: AppTheme.textSubtle),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                  // Add padding at bottom for FAB
                  const SizedBox(height: 80),
                ],
              ),
            ),
          ),
        ),
        // Floating Action Button
        Positioned(
          right: 16,
          bottom: 16,
          child: FloatingActionButton(
            onPressed: () => widget.onNavigate(ScreenType.askQuestion),
            backgroundColor: AppTheme.primary,
            elevation: 6,
            child: const Icon(Icons.add, color: Colors.white, size: 26),
          ),
        ),
      ],
    );
      },
    );
  }
}

