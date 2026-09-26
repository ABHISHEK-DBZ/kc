import 'package:flutter/material.dart';

enum ScreenType {
  splash,
  home,
  community,
  askQuestion,
  analyzing,
  questionSent,
  questionDetail,
  profile,
  leaders,
  knowledge,
}

class UserProfile {
  final String id;
  final String name;
  final String franchiseCode;
  final String city;
  final String avatarUrl;
  final String role;
  final int questionsCount;
  final int answersCount;
  final int savedPostsCount;

  const UserProfile({
    required this.id,
    required this.name,
    required this.franchiseCode,
    required this.city,
    required this.avatarUrl,
    required this.role,
    this.questionsCount = 12,
    this.answersCount = 142,
    this.savedPostsCount = 8,
  });
}

class BusinessHealthStats {
  final int score;
  final String status;
  final int transactionsToday;
  final int totalSalesToday;
  final int customersCount;
  final int creditGiven;
  final int inventoryAlertsCount;
  final String gstStatus;

  const BusinessHealthStats({
    required this.score,
    required this.status,
    required this.transactionsToday,
    required this.totalSalesToday,
    required this.customersCount,
    required this.creditGiven,
    required this.inventoryAlertsCount,
    required this.gstStatus,
  });
}

class CategoryItem {
  final String id;
  final String name;
  final IconData icon;
  final Color color;
  final Color bgColor;

  const CategoryItem({
    required this.id,
    required this.name,
    required this.icon,
    required this.color,
    required this.bgColor,
  });
}

class AppCategories {
  static const List<CategoryItem> all = [
    CategoryItem(
      id: 'all',
      name: 'All Topics',
      icon: Icons.grid_view_rounded,
      color: Color(0xFF6366F1),
      bgColor: Color(0xFFEEF2FF),
    ),
    CategoryItem(
      id: 'voice',
      name: 'Voice Entry',
      icon: Icons.mic_rounded,
      color: Color(0xFF2563EB),
      bgColor: Color(0xFFEFF6FF),
    ),
    CategoryItem(
      id: 'gst',
      name: 'GST & Tax',
      icon: Icons.description_rounded,
      color: Color(0xFF059669),
      bgColor: Color(0xFFECFDF5),
    ),
    CategoryItem(
      id: 'inventory',
      name: 'Inventory',
      icon: Icons.inventory_2_rounded,
      color: Color(0xFFEA580C),
      bgColor: Color(0xFFFFF7ED),
    ),
    CategoryItem(
      id: 'payments',
      name: 'Payments',
      icon: Icons.credit_card_rounded,
      color: Color(0xFFDB2777),
      bgColor: Color(0xFFFDF2F8),
    ),
    CategoryItem(
      id: 'device',
      name: 'Device Setup',
      icon: Icons.phone_android_rounded,
      color: Color(0xFF0284C7),
      bgColor: Color(0xFFF0F9FF),
    ),
    CategoryItem(
      id: 'troubleshoot',
      name: 'Troubleshooting',
      icon: Icons.build_rounded,
      color: Color(0xFFD97706),
      bgColor: Color(0xFFFFFBEB),
    ),
    CategoryItem(
      id: 'growth',
      name: 'Business Growth',
      icon: Icons.trending_up_rounded,
      color: Color(0xFF16A34A),
      bgColor: Color(0xFFF0FDF4),
    ),
  ];
}

class QuestionPost {
  final String id;
  final String title;
  final String body;
  final String authorName;
  final String authorFranchise;
  final String authorLocation;
  final String authorAvatar;
  final String? authorBadge;
  final String timeAgo;
  final String status;
  final List<String> tags;
  final int commentsCount;
  int upvotesCount;
  final String? aiCategory;
  final int? aiConfidence;

  QuestionPost({
    required this.id,
    required this.title,
    required this.body,
    required this.authorName,
    required this.authorFranchise,
    required this.authorLocation,
    required this.authorAvatar,
    this.authorBadge,
    required this.timeAgo,
    required this.status,
    required this.tags,
    required this.commentsCount,
    required this.upvotesCount,
    this.aiCategory,
    this.aiConfidence,
  });
}

class AISimilarQuestion {
  final String id;
  final String title;
  final int answersCount;
  final String status;
  final IconData icon;

  const AISimilarQuestion({
    required this.id,
    required this.title,
    required this.answersCount,
    required this.status,
    required this.icon,
  });
}

class LeaderboardUser {
  final int rank;
  final String name;
  final String franchiseCode;
  final String city;
  final int answersCount;
  final String avatarUrl;
  final String? badge;
  final bool isCurrentUser;

  const LeaderboardUser({
    required this.rank,
    required this.name,
    required this.franchiseCode,
    required this.city,
    required this.answersCount,
    required this.avatarUrl,
    this.badge,
    this.isCurrentUser = false,
  });
}

class KnowledgeArticle {
  final String id;
  final String title;
  final String category;
  final String subtitle;
  final Color iconBg;
  final Color iconColor;
  final IconData icon;

  const KnowledgeArticle({
    required this.id,
    required this.title,
    required this.category,
    required this.subtitle,
    required this.iconBg,
    required this.iconColor,
    required this.icon,
  });
}
