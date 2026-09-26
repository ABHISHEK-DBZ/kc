import 'package:flutter/material.dart';
import '../models/app_models.dart';
import '../theme/app_theme.dart';
import '../services/app_state.dart';

class QuestionDetailScreen extends StatefulWidget {
  final Function(ScreenType) onNavigate;

  const QuestionDetailScreen({super.key, required this.onNavigate});

  @override
  State<QuestionDetailScreen> createState() => _QuestionDetailScreenState();
}

class _QuestionDetailScreenState extends State<QuestionDetailScreen> {
  final TextEditingController _replyController = TextEditingController();

  @override
  void dispose() {
    _replyController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: AppState.instance,
      builder: (context, _) {
        final activeId = AppState.instance.activeQuestionId;
        final post = AppState.instance.questions.firstWhere(
          (q) => q.id == activeId,
          orElse: () => AppState.instance.questions.first,
        );

        final replies = AppState.instance.questionReplies[post.id] ?? [];
        final isFollowing = AppState.instance.isFollowing(post.id);
        final isSolved = post.status == 'Solved';

        return Scaffold(
          backgroundColor: AppTheme.bgLight,
          appBar: AppBar(
            title: Text('Question #${post.id}'),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () => widget.onNavigate(ScreenType.community),
            ),
          ),
          body: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 700),
              child: Column(
                children: [
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Main Question Card
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: AppTheme.borderLight),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  post.title,
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w900,
                                    color: AppTheme.textMain,
                                    height: 1.3,
                                  ),
                                ),
                                if (post.body.isNotEmpty && post.body != post.title) ...[
                                  const SizedBox(height: 6),
                                  Text(
                                    post.body,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: AppTheme.textMuted,
                                      height: 1.4,
                                    ),
                                  ),
                                ],
                                const SizedBox(height: 12),

                                // Author Row
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        CircleAvatar(
                                          radius: 16,
                                          backgroundImage: NetworkImage(post.authorAvatar),
                                        ),
                                        const SizedBox(width: 8),
                                        Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              post.authorName,
                                              style: const TextStyle(
                                                fontSize: 12,
                                                fontWeight: FontWeight.bold,
                                                color: AppTheme.textMain,
                                              ),
                                            ),
                                            Text(
                                              '${post.authorFranchise} • ${post.authorLocation} • ${post.timeAgo}',
                                              style: const TextStyle(
                                                fontSize: 10,
                                                color: AppTheme.textSubtle,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                    OutlinedButton(
                                      onPressed: () => AppState.instance.toggleFollow(post.id),
                                      style: OutlinedButton.styleFrom(
                                        backgroundColor:
                                            isFollowing ? AppTheme.primary : AppTheme.primaryLight,
                                        foregroundColor: isFollowing ? Colors.white : AppTheme.primary,
                                        side: BorderSide(
                                          color: isFollowing
                                              ? AppTheme.primary
                                              : const Color(0xFFBFDBFE),
                                        ),
                                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                        minimumSize: const Size(60, 30),
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(16),
                                        ),
                                      ),
                                      child: Text(
                                        isFollowing ? 'Following' : 'Follow',
                                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 10),

                                // Tags
                                Wrap(
                                  spacing: 6,
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
                                const SizedBox(height: 12),

                                // Interactions
                                Row(
                                  children: [
                                    const Icon(Icons.chat_bubble_outline_rounded,
                                        size: 14, color: AppTheme.textSubtle),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${post.commentsCount}',
                                      style: const TextStyle(fontSize: 11, color: AppTheme.textSubtle),
                                    ),
                                    const SizedBox(width: 16),
                                    InkWell(
                                      onTap: () => AppState.instance.toggleUpvoteQuestion(post.id),
                                      child: Row(
                                        children: [
                                          const Icon(
                                            Icons.thumb_up_alt_outlined,
                                            size: 14,
                                            color: AppTheme.primary,
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            '${post.upvotesCount}',
                                            style: const TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                              color: AppTheme.primary,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(width: 16),
                                    const Icon(Icons.share_outlined, size: 14, color: AppTheme.textSubtle),
                                    const SizedBox(width: 4),
                                    const Text('Share', style: TextStyle(fontSize: 11, color: AppTheme.textSubtle)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),

                          // KhataCopilot AI Suggested Answer Card
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                                colors: [Color(0xFFEFF6FF), Color(0xFFF8FAFC), Colors.white],
                              ),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: isSolved ? const Color(0xFFA7F3D0) : const Color(0xFFBFDBFE),
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        Icon(
                                          Icons.auto_awesome,
                                          color: isSolved ? AppTheme.emeraldSuccess : AppTheme.primary,
                                          size: 16,
                                        ),
                                        const SizedBox(width: 6),
                                        Text(
                                          isSolved ? 'Solution Verified by AI' : 'KhataCopilot AI',
                                          style: TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w800,
                                            color: isSolved ? AppTheme.emeraldSuccess : AppTheme.primary,
                                          ),
                                        ),
                                      ],
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: isSolved ? AppTheme.emeraldLight : const Color(0xFFDBEAFE),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Text(
                                        isSolved
                                            ? 'Status: Solved (Knowledge Base Synced)'
                                            : 'AI suggested answer • 94% confidence',
                                        style: TextStyle(
                                          fontSize: 9.5,
                                          fontWeight: FontWeight.bold,
                                          color: isSolved ? AppTheme.emeraldSuccess : const Color(0xFF1E40AF),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 10),
                                const Text(
                                  'Try this solution first:',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.textMain,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                ..._getSolutionStepsForCategory(post.aiCategory).asMap().entries.map((entry) {
                                  return _numberedStep('${entry.key + 1}', entry.value);
                                }),
                                const SizedBox(height: 12),

                                SizedBox(
                                  width: double.infinity,
                                  height: 42,
                                  child: ElevatedButton.icon(
                                    onPressed: () {
                                      final dynSteps = _getSolutionStepsForCategory(post.aiCategory);
                                      AppState.instance.applySolution(
                                        post.id,
                                        dynSteps.first,
                                      );
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        const SnackBar(
                                          content: Text(
                                            'Solution Applied! Knowledge Extraction Agent published new article in Knowledge Base.',
                                          ),
                                          backgroundColor: AppTheme.emeraldSuccess,
                                        ),
                                      );
                                    },
                                    icon: Icon(
                                      isSolved ? Icons.check_circle : Icons.play_arrow_rounded,
                                      size: 16,
                                    ),
                                    label: Text(
                                      isSolved ? 'Solution Verified & Added to KB' : 'Try This Solution',
                                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                                    ),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor:
                                          isSolved ? AppTheme.emeraldSuccess : AppTheme.primary,
                                      foregroundColor: Colors.white,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      elevation: 2,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 14),

                          // Community Replies
                          Text(
                            'Community Replies (${replies.length})',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: AppTheme.textMuted,
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(height: 8),

                          if (replies.isEmpty)
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: AppTheme.borderLight),
                              ),
                              child: const Center(
                                child: Text(
                                  'No community replies yet. Be the first to answer!',
                                  style: TextStyle(fontSize: 12, color: AppTheme.textMuted),
                                ),
                              ),
                            )
                          else
                            ...replies.map((reply) {
                              return Container(
                                margin: const EdgeInsets.only(bottom: 8),
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(color: AppTheme.borderLight),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Row(
                                          children: [
                                            CircleAvatar(
                                              radius: 14,
                                              backgroundImage: NetworkImage(reply.avatar),
                                            ),
                                            const SizedBox(width: 8),
                                            Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  reply.author,
                                                  style: const TextStyle(
                                                    fontSize: 12,
                                                    fontWeight: FontWeight.bold,
                                                    color: AppTheme.textMain,
                                                  ),
                                                ),
                                                Text(
                                                  '${reply.franchise} • ${reply.city} • ${reply.timeAgo}',
                                                  style: const TextStyle(
                                                    fontSize: 10,
                                                    color: AppTheme.textSubtle,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                        if (reply.badge != null)
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: AppTheme.amberLight,
                                              borderRadius: BorderRadius.circular(8),
                                              border: Border.all(color: const Color(0xFFFDE68A)),
                                            ),
                                            child: Row(
                                              children: [
                                                const Icon(Icons.star, size: 10, color: AppTheme.amberWarning),
                                                const SizedBox(width: 2),
                                                Text(
                                                  reply.badge!,
                                                  style: const TextStyle(
                                                    fontSize: 9.5,
                                                    fontWeight: FontWeight.bold,
                                                    color: AppTheme.amberWarning,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      reply.text,
                                      style: const TextStyle(fontSize: 12, color: AppTheme.textMain, height: 1.35),
                                    ),
                                    const SizedBox(height: 8),
                                    Row(
                                      children: [
                                        InkWell(
                                          onTap: () => AppState.instance.toggleUpvoteReply(post.id, reply.id),
                                          child: Row(
                                            children: [
                                              Icon(
                                                reply.hasLiked ? Icons.thumb_up : Icons.thumb_up_alt_outlined,
                                                size: 13,
                                                color: reply.hasLiked ? AppTheme.primary : AppTheme.textSubtle,
                                              ),
                                              const SizedBox(width: 4),
                                              Text(
                                                '${reply.likes} Likes',
                                                style: TextStyle(
                                                  fontSize: 10.5,
                                                  fontWeight: reply.hasLiked ? FontWeight.bold : FontWeight.normal,
                                                  color: reply.hasLiked ? AppTheme.primary : AppTheme.textSubtle,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              );
                            }),
                        ],
                      ),
                    ),
                  ),

                  // Bottom Reply Composer
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      border: Border(top: BorderSide(color: AppTheme.borderLight)),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Container(
                            height: 40,
                            padding: const EdgeInsets.symmetric(horizontal: 14),
                            decoration: BoxDecoration(
                              color: AppTheme.bgLight,
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: TextField(
                              controller: _replyController,
                              style: const TextStyle(fontSize: 12),
                              decoration: const InputDecoration(
                                hintText: 'Write your answer or suggestion...',
                                hintStyle: TextStyle(fontSize: 12, color: AppTheme.textSubtle),
                                border: InputBorder.none,
                              ),
                              onSubmitted: (val) {
                                if (val.trim().isNotEmpty) {
                                  AppState.instance.addReply(
                                    questionId: post.id,
                                    text: val.trim(),
                                  );
                                  _replyController.clear();
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Your reply has been posted!'),
                                      duration: Duration(seconds: 1),
                                    ),
                                  );
                                }
                              },
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        IconButton(
                          onPressed: () {
                            final val = _replyController.text.trim();
                            if (val.isNotEmpty) {
                              AppState.instance.addReply(
                                questionId: post.id,
                                text: val,
                              );
                              _replyController.clear();
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Your reply has been posted to community!'),
                                  duration: Duration(seconds: 1),
                                ),
                              );
                            }
                          },
                          style: IconButton.styleFrom(
                            backgroundColor: AppTheme.primary,
                            foregroundColor: Colors.white,
                          ),
                          icon: const Icon(Icons.send_rounded, size: 16),
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

  Widget _numberedStep(String num, String step) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '$num. ',
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMuted),
          ),
          Expanded(
            child: Text(
              step,
              style: const TextStyle(fontSize: 11, color: Color(0xFF334155)),
            ),
          ),
        ],
      ),
    );
  }

  List<String> _getSolutionStepsForCategory(String? category) {
    final cat = (category ?? '').toLowerCase();
    if (cat.contains('gst') || cat.contains('tax')) {
      return [
        'Go to Reports → GST Reports',
        'Click on "Re-sync Data & Refresh Ledger"',
        'Verify financial year and HSN summaries',
        'Generate and validate GSTR-1 JSON export',
      ];
    } else if (cat.contains('voice') || cat.contains('speech')) {
      return [
        'Open Voice Assistant settings',
        'Grant microphone & audio permissions in Android Settings',
        'Verify dialect selection (Hindi / Hinglish / English)',
        'Test voice recording: speak product name + quantity',
      ];
    } else if (cat.contains('device') || cat.contains('printer') || cat.contains('hardware')) {
      return [
        'Verify Bluetooth / USB connection is turned ON',
        'Open Settings → Hardware → Printer / Scanner pairing',
        'Select printer model (ESC/POS 58mm or 80mm) and send test print',
        'Save paired profile as default cashier station printer',
      ];
    } else if (cat.contains('inventory') || cat.contains('stock') || cat.contains('barcode')) {
      return [
        'Navigate to Khata → Inventory Management',
        'Tap "Stock Audit & Barcode Sync"',
        'Scan item barcode or manually input batch/lot number',
        'Confirm stock count and save changes to sync across POS',
      ];
    } else if (cat.contains('payment') || cat.contains('upi')) {
      return [
        'Check Soundbox & POS payment terminal connectivity',
        'Navigate to Payments → Settlement Reconciliation',
        'Tap "Fetch Pending Bank Settlements"',
        'Verify webhook response status and mark transaction complete',
      ];
    } else {
      return [
        'Verify active network and cloud sync connection',
        'Refresh local cache in Settings → Network Diagnostics',
        'Review audit log errors in Merchant Diagnostics',
        'Retry operation or request live escalation from certified peer',
      ];
    }
  }
}
