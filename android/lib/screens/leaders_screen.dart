import 'package:flutter/material.dart';
import '../models/app_models.dart';
import '../theme/app_theme.dart';
import '../services/app_state.dart';

class CommunityLeadersScreen extends StatefulWidget {
  final Function(ScreenType) onNavigate;

  const CommunityLeadersScreen({super.key, required this.onNavigate});

  @override
  State<CommunityLeadersScreen> createState() => _CommunityLeadersScreenState();
}

class _CommunityLeadersScreenState extends State<CommunityLeadersScreen> {
  String _selectedFilter = 'All';

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: AppState.instance,
      builder: (context, _) {
        final allLeaders = AppState.instance.leaders;
        final filteredLeaders = allLeaders.where((l) {
          if (_selectedFilter == 'Mumbai') return l.city.toLowerCase() == 'mumbai';
          if (_selectedFilter == 'HQ Support') return l.franchiseCode.contains('HQ') || l.name.contains('Ankit');
          if (_selectedFilter == 'Top Helpers') return l.answersCount >= 50;
          return true;
        }).toList();

        final top1 = filteredLeaders.isNotEmpty ? filteredLeaders[0] : allLeaders[0];
        final top2 = filteredLeaders.length > 1 ? filteredLeaders[1] : allLeaders[1];
        final top3 = filteredLeaders.length > 2 ? filteredLeaders[2] : allLeaders[2];
        final runnersUp = filteredLeaders.length > 3 ? filteredLeaders.sublist(3) : allLeaders.sublist(3);

    return Scaffold(
      backgroundColor: AppTheme.bgLight,
      appBar: AppBar(
        title: const Text('Community Leaders'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => widget.onNavigate(ScreenType.community),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 14),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Row(
              children: [
                Text(
                  'This Month',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textMain,
                  ),
                ),
                Icon(Icons.arrow_drop_down, size: 16, color: AppTheme.textMuted),
              ],
            ),
          ),
        ],
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 700),
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: Column(
              children: [
                // Filter Pills
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: ['All', 'Mumbai', 'Top Helpers', 'HQ Support'].map((tab) {
                      final isSelected = _selectedFilter == tab;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8.0),
                        child: ChoiceChip(
                          label: Text(tab),
                          selected: isSelected,
                          onSelected: (_) => setState(() => _selectedFilter = tab),
                          selectedColor: AppTheme.primary,
                          labelStyle: TextStyle(
                            color: isSelected ? Colors.white : AppTheme.textMuted,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                          backgroundColor: Colors.white,
                          side: BorderSide(
                            color: isSelected ? AppTheme.primary : AppTheme.borderMedium,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: 20),

                // Podium Top 3 (2 - 1 - 3 layout)
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    // #2 Silver (Priya Gupta)
                    Expanded(
                      child: _podiumCard(
                        user: top2,
                        rank: 2,
                        crownColor: const Color(0xFF94A3B8),
                        borderColor: const Color(0xFFCBD5E1),
                        avatarSize: 52,
                      ),
                    ),
                    const SizedBox(width: 8),

                    // #1 Gold (Ankit Verma)
                    Expanded(
                      child: _podiumCard(
                        user: top1,
                        rank: 1,
                        crownColor: const Color(0xFFF59E0B),
                        borderColor: const Color(0xFFFBBF24),
                        avatarSize: 64,
                        isCenterGold: true,
                      ),
                    ),
                    const SizedBox(width: 8),

                    // #3 Bronze (Rajesh Sharma)
                    Expanded(
                      child: _podiumCard(
                        user: top3,
                        rank: 3,
                        crownColor: const Color(0xFFB45309),
                        borderColor: const Color(0xFFD97706),
                        avatarSize: 52,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Ranked Runners-up List
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(22),
                    border: Border.all(color: AppTheme.borderLight),
                  ),
                  child: ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: runnersUp.length,
                    separatorBuilder: (_, __) =>
                        const Divider(height: 1, color: Color(0xFFF8FAFC)),
                    itemBuilder: (context, index) {
                      final item = runnersUp[index];
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 10.0),
                        child: Row(
                          children: [
                            SizedBox(
                              width: 24,
                              child: Text(
                                '${item.rank}',
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w900,
                                  color: AppTheme.textSubtle,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            ),
                            const SizedBox(width: 10),
                            CircleAvatar(
                              radius: 17,
                              backgroundImage: NetworkImage(item.avatarUrl),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.name,
                                    style: const TextStyle(
                                      fontSize: 12.5,
                                      fontWeight: FontWeight.bold,
                                      color: AppTheme.textMain,
                                    ),
                                  ),
                                  Text(
                                    '${item.franchiseCode} • ${item.city}',
                                    style: const TextStyle(
                                      fontSize: 10,
                                      color: AppTheme.textSubtle,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  '${item.answersCount}',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w900,
                                    color: AppTheme.textMain,
                                  ),
                                ),
                                const Text(
                                  'answers',
                                  style: TextStyle(
                                    fontSize: 9.5,
                                    color: AppTheme.textSubtle,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
      },
    );
  }

  Widget _podiumCard({
    required LeaderboardUser user,
    required int rank,
    required Color crownColor,
    required Color borderColor,
    required double avatarSize,
    bool isCenterGold = false,
  }) {
    return Column(
      children: [
        Stack(
          alignment: Alignment.center,
          clipBehavior: Clip.none,
          children: [
            // Avatar
            Container(
              width: avatarSize,
              height: avatarSize,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: borderColor, width: isCenterGold ? 3 : 2),
                boxShadow: [
                  BoxShadow(
                    color: crownColor.withValues(alpha: 0.2),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: ClipOval(
                child: Image.network(user.avatarUrl, fit: BoxFit.cover),
              ),
            ),
            // Crown
            Positioned(
              top: -14,
              child: Icon(Icons.workspace_premium_rounded, color: crownColor, size: isCenterGold ? 22 : 18),
            ),
            // Rank Badge
            Positioned(
              bottom: -4,
              child: Container(
                width: 18,
                height: 18,
                decoration: BoxDecoration(
                  color: isCenterGold ? const Color(0xFFF59E0B) : const Color(0xFFE2E8F0),
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 1.5),
                ),
                child: Center(
                  child: Text(
                    '$rank',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      color: isCenterGold ? Colors.white : AppTheme.textMain,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Text(
          user.name,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: AppTheme.textMain,
          ),
          textAlign: TextAlign.center,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        if (user.badge != null)
          Container(
            margin: const EdgeInsets.only(top: 2),
            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF3C7),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              user.badge!,
              style: const TextStyle(
                fontSize: 8.5,
                fontWeight: FontWeight.bold,
                color: Color(0xFFB45309),
              ),
            ),
          )
        else
          Text(
            user.franchiseCode,
            style: const TextStyle(
              fontSize: 9.5,
              color: AppTheme.textSubtle,
            ),
          ),
        const SizedBox(height: 2),
        Text(
          '${user.answersCount} answers',
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w900,
            color: isCenterGold ? const Color(0xFFD97706) : AppTheme.primary,
          ),
        ),
      ],
    );
  }
}
