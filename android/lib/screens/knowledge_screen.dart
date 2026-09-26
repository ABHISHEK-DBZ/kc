import 'package:flutter/material.dart';
import '../models/app_models.dart';
import '../theme/app_theme.dart';
import '../services/app_state.dart';

class KnowledgeBaseScreen extends StatefulWidget {
  final Function(ScreenType) onNavigate;

  const KnowledgeBaseScreen({super.key, required this.onNavigate});

  @override
  State<KnowledgeBaseScreen> createState() => _KnowledgeBaseScreenState();
}

class _KnowledgeBaseScreenState extends State<KnowledgeBaseScreen> {
  String _activeCategory = 'All';
  String _searchQuery = '';

  void _showArticleDetails(KnowledgeArticle article) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      backgroundColor: Colors.white,
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: article.iconBg,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(article.icon, color: article.iconColor, size: 22),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          article.category,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: article.iconColor,
                          ),
                        ),
                        Text(
                          article.title,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w900,
                            color: AppTheme.textMain,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Text(
                article.subtitle,
                style: const TextStyle(fontSize: 12, color: AppTheme.textMuted, height: 1.4),
              ),
              const SizedBox(height: 16),
              const Text(
                'Standard Operating Procedure (SOP):',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppTheme.textMain),
              ),
              const SizedBox(height: 6),
              const Text('1. Ensure KhataCopilot v2.4+ is installed.', style: TextStyle(fontSize: 11, color: Color(0xFF334155))),
              const Text('2. Validate ledger entries before final tax generation.', style: TextStyle(fontSize: 11, color: Color(0xFF334155))),
              const Text('3. Sync local offline database with cloud ledger if totals differ.', style: TextStyle(fontSize: 11, color: Color(0xFF334155))),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(ctx);
                    widget.onNavigate(ScreenType.questionDetail);
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('View Linked Community Thread'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: AppState.instance,
      builder: (context, _) {
        final filteredArticles = AppState.instance.articles.where((art) {
          if (_activeCategory != 'All' && art.category != _activeCategory) return false;
          if (_searchQuery.isNotEmpty &&
              !art.title.toLowerCase().contains(_searchQuery.toLowerCase()) &&
              !art.subtitle.toLowerCase().contains(_searchQuery.toLowerCase())) {
            return false;
          }
          return true;
        }).toList();

        return Scaffold(
          backgroundColor: AppTheme.bgLight,
          appBar: AppBar(
            title: const Text('Knowledge Base'),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back),
              onPressed: () => widget.onNavigate(ScreenType.community),
            ),
          ),
          body: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 700),
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Search Input
                    Container(
                      height: 42,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppTheme.borderLight),
                      ),
                      child: TextField(
                        onChanged: (val) => setState(() => _searchQuery = val),
                        style: const TextStyle(fontSize: 12),
                        decoration: const InputDecoration(
                          hintText: 'Search guides, tutorials, solutions...',
                          hintStyle: TextStyle(fontSize: 12, color: AppTheme.textSubtle),
                          prefixIcon: Icon(Icons.search, size: 18, color: AppTheme.textSubtle),
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(vertical: 10),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Filter Pills
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: ['All', 'Getting Started', 'Voice Entry', 'Inventory', 'GST & Tax'].map((tab) {
                          final isSelected = _activeCategory == tab;
                          return Padding(
                            padding: const EdgeInsets.only(right: 8.0),
                            child: ChoiceChip(
                              label: Text(tab),
                              selected: isSelected,
                              onSelected: (_) => setState(() => _activeCategory = tab),
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
                    const SizedBox(height: 16),

                    // Popular Articles Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Popular Articles',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.textMain,
                          ),
                        ),
                        Text(
                          '${filteredArticles.length} items',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.textSubtle,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    // Articles List
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(22),
                        border: Border.all(color: AppTheme.borderLight),
                      ),
                      child: ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: filteredArticles.length,
                        separatorBuilder: (_, __) =>
                            const Divider(height: 1, color: Color(0xFFF8FAFC)),
                        itemBuilder: (context, index) {
                          final article = filteredArticles[index];
                          return InkWell(
                            onTap: () => _showArticleDetails(article),
                            borderRadius: BorderRadius.circular(22),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 12.0),
                              child: Row(
                                children: [
                                  Container(
                                    width: 38,
                                    height: 38,
                                    decoration: BoxDecoration(
                                      color: article.iconBg,
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Icon(article.icon, color: article.iconColor, size: 20),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          article.title,
                                          style: const TextStyle(
                                            fontSize: 12.5,
                                            fontWeight: FontWeight.bold,
                                            color: AppTheme.textMain,
                                          ),
                                        ),
                                        const SizedBox(height: 1),
                                        Text(
                                          article.subtitle,
                                          style: const TextStyle(
                                            fontSize: 10.5,
                                            color: AppTheme.textSubtle,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const Icon(Icons.chevron_right, size: 18, color: AppTheme.textSubtle),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Knowledge Agent Banner
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppTheme.emeraldLight,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFA7F3D0)),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.auto_stories_rounded, color: AppTheme.emeraldSuccess, size: 22),
                          SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Auto-Curated by Knowledge Agent',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF065F46),
                                  ),
                                ),
                                SizedBox(height: 2),
                                Text(
                                  'Verified answers from franchise community discussions are continuously promoted into reusable articles.',
                                  style: TextStyle(fontSize: 10.5, color: Color(0xFF047857), height: 1.3),
                                ),
                              ],
                            ),
                          ),
                        ],
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
}
