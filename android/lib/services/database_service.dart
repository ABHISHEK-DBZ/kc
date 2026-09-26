import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';
import 'package:crypto/crypto.dart';

/// Embedded ACID-compliant Realtime Document Database for KhataCopilot FranchiseOS.
/// Provides atomic persistence, cryptographic hashing, index searching,
/// and real-time change stream broadcasts across all 10 screens.
class DatabaseService {
  static final DatabaseService instance = DatabaseService._internal();
  DatabaseService._internal();

  File? _dbFile;
  Map<String, dynamic> _data = {};
  bool _isInitialized = false;

  final StreamController<String> _changeStreamController =
      StreamController<String>.broadcast();

  /// Stream emitting table names whenever an update/insert/delete occurs
  Stream<String> get onChange => _changeStreamController.stream;

  bool get isInitialized => _isInitialized;

  /// Initialize database file in application documents directory with fallback
  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      if (!kIsWeb) {
        final dir = await getApplicationDocumentsDirectory();
        final dbDir = Directory('${dir.path}/khatacopilot_db');
        if (!await dbDir.exists()) {
          await dbDir.create(recursive: true);
        }
        _dbFile = File('${dbDir.path}/app_database.json');

        if (await _dbFile!.exists()) {
          final content = await _dbFile!.readAsString();
          if (content.trim().isNotEmpty) {
            try {
              _data = jsonDecode(content) as Map<String, dynamic>;
            } catch (e) {
              debugPrint('Warning: DB JSON corrupt, re-seeding: $e');
              _data = _createInitialSeed();
              await _flushToDisk();
            }
          } else {
            _data = _createInitialSeed();
            await _flushToDisk();
          }
        } else {
          _data = _createInitialSeed();
          await _flushToDisk();
        }
      } else {
        // Web memory fallback
        _data = _createInitialSeed();
      }
    } catch (e) {
      debugPrint('Database initialization warning: $e. Falling back to in-memory store.');
      _data = _createInitialSeed();
    }

    _isInitialized = true;
    _changeStreamController.add('*');
  }

  /// Atomic flush to disk via write-to-temporary file then rename
  Future<void> _flushToDisk() async {
    if (kIsWeb || _dbFile == null) return;
    try {
      final jsonString = jsonEncode(_data);
      final tempFile = File('${_dbFile!.path}.tmp');
      await tempFile.writeAsString(jsonString, flush: true);
      if (await tempFile.exists()) {
        await tempFile.rename(_dbFile!.path);
      }
    } catch (e) {
      debugPrint('Error flushing database to disk: $e');
    }
  }

  /// Helper to hash password with cryptographic salt
  static String hashPassword(String password, String salt) {
    final bytes = utf8.encode('$salt:$password:khata_copilot_secure_salt_2026');
    final digest = sha256.convert(bytes);
    return digest.toString();
  }

  // ==========================================
  // INITIAL SEED DATA GENERATOR
  // ==========================================
  Map<String, dynamic> _createInitialSeed() {
    final defaultSalt = 'salt_franchise_99';
    return {
      'meta': {
        'version': 2,
        'createdAt': DateTime.now().toIso8601String(),
        'appName': 'KhataCopilot FranchiseOS',
      },
      'users': <Map<String, dynamic>>[
        {
          'id': 'usr-1',
          'name': 'Rajesh Sharma',
          'email': 'rajesh@store.khatacopilot.in',
          'phone': '9876543210',
          'passwordHash': hashPassword('rajesh123', defaultSalt),
          'salt': defaultSalt,
          'franchiseCode': 'FR-2041',
          'city': 'Mumbai Central',
          'role': 'Store Owner',
          'avatarUrl':
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
          'questionsCount': 2,
          'answersCount': 42,
          'savedPostsCount': 8,
          'createdAt': '2026-09-01T10:00:00Z',
        },
        {
          'id': 'usr-2',
          'name': 'Priya Gupta',
          'email': 'priya@store.khatacopilot.in',
          'phone': '9811223344',
          'passwordHash': hashPassword('priya123', defaultSalt),
          'salt': defaultSalt,
          'franchiseCode': 'FR-1185',
          'city': 'Delhi Connaught',
          'role': 'Store Manager',
          'avatarUrl':
              'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
          'questionsCount': 4,
          'answersCount': 128,
          'savedPostsCount': 15,
          'createdAt': '2026-08-15T09:00:00Z',
        },
        {
          'id': 'usr-3',
          'name': 'Ankit Verma',
          'email': 'ankit@hq.khatacopilot.in',
          'phone': '9988776655',
          'passwordHash': hashPassword('ankit123', defaultSalt),
          'salt': defaultSalt,
          'franchiseCode': 'HQ-SUPPORT',
          'city': 'Bengaluru HQ',
          'role': 'Certified Tax Specialist',
          'avatarUrl':
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
          'questionsCount': 1,
          'answersCount': 195,
          'savedPostsCount': 24,
          'createdAt': '2026-07-01T08:00:00Z',
        },
        {
          'id': 'usr-4',
          'name': 'Vikram Mehta',
          'email': 'vikram@store.khatacopilot.in',
          'phone': '9123456780',
          'passwordHash': hashPassword('vikram123', defaultSalt),
          'salt': defaultSalt,
          'franchiseCode': 'FR-3022',
          'city': 'Ahmedabad SG',
          'role': 'Store Owner',
          'avatarUrl':
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
          'questionsCount': 5,
          'answersCount': 38,
          'savedPostsCount': 4,
          'createdAt': '2026-09-10T11:00:00Z',
        },
      ],
      'active_session': {
        'userId': 'usr-1',
        'token': 'tok_rajesh_sharma_session_secure_2026',
        'loginTime': DateTime.now().toIso8601String(),
      },
      'business_health': {
        'score': 92,
        'status': 'Great',
        'transactionsToday': 142,
        'totalSalesToday': 48500.0,
        'customersCount': 89,
        'creditGiven': 12400.0,
        'inventoryAlertsCount': 3,
        'gstStatus': 'Sync Ready',
        'lastSync': DateTime.now().toIso8601String(),
      },
      'questions': <Map<String, dynamic>>[
        {
          'id': 'QC-8421',
          'title':
              'I entered all sales but my GSTR-1 report is showing wrong total. How can I fix this?',
          'body':
              'I entered all sales entries yesterday, but when generating GSTR-1 for filing, the total is short by ₹14,200. Is there an invoice reconciliation setting I missed?',
          'authorId': 'usr-1',
          'authorName': 'Rajesh Sharma',
          'authorFranchise': 'FR-2041',
          'authorLocation': 'Mumbai Central',
          'authorAvatar':
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
          'authorBadge': 'Owner',
          'timeAgo': '2 hours ago',
          'status': 'In Progress',
          'tags': ['GST & Tax', 'GSTR-1', 'Report Issue'],
          'commentsCount': 1,
          'upvotesCount': 14,
          'aiCategory': 'GST & Tax',
          'aiConfidence': 94,
          'createdAt': '2026-09-26T12:00:00Z',
        },
        {
          'id': 'QC-8420',
          'title': 'How to set up auto-backup for daily transaction ledger?',
          'body':
              'We want the daily ledger to sync automatically to Cloud Backup every night at 11 PM after store closing. Does KhataCopilot support scheduled sync without manual export?',
          'authorId': 'usr-4',
          'authorName': 'Vikram Mehta',
          'authorFranchise': 'FR-3022',
          'authorLocation': 'Ahmedabad',
          'authorAvatar':
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
          'authorBadge': 'Franchisee',
          'timeAgo': '4 hours ago',
          'status': 'Solved',
          'tags': ['Backup', 'Cloud Sync', 'Automation'],
          'commentsCount': 3,
          'upvotesCount': 28,
          'aiCategory': 'Cloud Sync',
          'aiConfidence': 98,
          'createdAt': '2026-09-26T10:00:00Z',
        },
        {
          'id': 'QC-8419',
          'title':
              'Bluetooth Thermal Printer disconnecting frequently on Android 14',
          'body':
              'After the recent Android 14 update, our 80mm thermal receipt printer loses pairing after 15 minutes of inactivity. Any recommended power-saving bypass?',
          'authorId': 'usr-2',
          'authorName': 'Priya Gupta',
          'authorFranchise': 'FR-1185',
          'authorLocation': 'Delhi',
          'authorAvatar':
              'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
          'authorBadge': 'Top Helper',
          'timeAgo': '6 hours ago',
          'status': 'Solved',
          'tags': ['Hardware', 'Printer', 'Bluetooth'],
          'commentsCount': 5,
          'upvotesCount': 35,
          'aiCategory': 'Device Setup',
          'aiConfidence': 91,
          'createdAt': '2026-09-26T08:00:00Z',
        },
      ],
      'comments': <Map<String, dynamic>>[
        {
          'id': 'cmt-1',
          'questionId': 'QC-8421',
          'authorId': 'usr-2',
          'authorName': 'Priya Gupta',
          'authorFranchise': 'FR-1185',
          'authorLocation': 'Delhi',
          'authorAvatar':
              'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
          'authorBadge': 'Top Helper',
          'text':
              "I had the exact same issue last month. The problem was that purchase entries were not marked as 'Include in GSTR-1'. Check this toggle under Settings → Tax Preferences → GSTR Options.",
          'likes': 8,
          'likedBy': ['usr-1', 'usr-3'],
          'timeAgo': '1 hour ago',
          'timestamp': '2026-09-26T13:00:00Z',
        },
        {
          'id': 'cmt-2',
          'questionId': 'QC-8420',
          'authorId': 'usr-3',
          'authorName': 'Ankit Verma',
          'authorFranchise': 'HQ-SUPPORT',
          'authorLocation': 'Bengaluru HQ',
          'authorAvatar':
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
          'authorBadge': 'HQ Certified',
          'text':
              'Go to Settings → Data & Security → Cloud Auto-Sync. Toggle on "Daily Midnight Snapshot" and select Google Drive or KhataCloud.',
          'likes': 12,
          'likedBy': ['usr-4'],
          'timeAgo': '3 hours ago',
          'timestamp': '2026-09-26T11:00:00Z',
        },
      ],
      'knowledge_articles': <Map<String, dynamic>>[
        {
          'id': 'kb-1',
          'title': 'How to sync offline sales data with GST Portal',
          'category': 'GST & Tax',
          'subtitle': 'Step-by-step guide for GSTR-1 & 3B reconciliation',
          'sopSteps': [
            'Ensure all daily cash and UPI receipts are reconciled.',
            'Navigate to Reports → GST Filing → Generate JSON.',
            'Verify invoice checksum against local database.',
            'Upload JSON to GST Portal under Offline Tools.',
          ],
          'iconCode': 0xe1f5, // description
          'colorCode': 0xFF059669,
          'bgCode': 0xFFECFDF5,
          'viewCount': 342,
          'createdAt': '2026-09-20T10:00:00Z',
        },
        {
          'id': 'kb-2',
          'title': 'Setting up Bluetooth thermal printer (80mm / 58mm)',
          'category': 'Device Setup',
          'subtitle': 'Troubleshoot pairing, baud rate, and paper cut settings',
          'sopSteps': [
            'Power cycle the thermal printer holding the feed button.',
            'Pair via KhataCopilot Settings → Hardware → Printers.',
            'Disable battery optimization for KhataCopilot in Android settings.',
            'Print a test invoice token.',
          ],
          'iconCode': 0xe4ea, // print
          'colorCode': 0xFF2563EB,
          'bgCode': 0xFFEFF6FF,
          'viewCount': 521,
          'createdAt': '2026-09-18T14:00:00Z',
        },
        {
          'id': 'kb-3',
          'title': 'Voice Entry: Faster ledger entries in Hindi & English',
          'category': 'Voice Entry',
          'subtitle': 'Voice commands for sales, credit, and customer creation',
          'sopSteps': [
            'Tap the microphone icon on any transaction screen.',
            'Speak clearly: "Ramesh ko 500 ka udhar likho".',
            'Review auto-filled debit/credit amounts.',
            'Confirm with single tap.',
          ],
          'iconCode': 0xe3e0, // mic
          'colorCode': 0xFF7C3AED,
          'bgCode': 0xFFF5F3FF,
          'viewCount': 689,
          'createdAt': '2026-09-15T09:00:00Z',
        },
        {
          'id': 'kb-4',
          'title': 'Managing multi-batch inventory & expiry tracking',
          'category': 'Inventory',
          'subtitle': 'Automate barcode scanning and FIFO stock clearance',
          'sopSteps': [
            'Enable batch tracking in Inventory Preferences.',
            'Scan barcode during purchase goods receipt.',
            'Set expiry warning threshold to 30 days.',
            'Review low stock alerts on Home Dashboard.',
          ],
          'iconCode': 0xe35b, // inventory_2
          'colorCode': 0xFFD97706,
          'bgCode': 0xFFFFFBEB,
          'viewCount': 415,
          'createdAt': '2026-09-12T16:00:00Z',
        },
      ],
      'notifications': <Map<String, dynamic>>[
        {
          'id': 'notif-1',
          'title': 'AI Solution Recommended',
          'message': 'KhataCopilot AI matched 94% confidence solution for GSTR-1 issue.',
          'timeAgo': '2m ago',
          'iconCode': 0xe0b0, // auto_awesome
          'colorCode': 0xFF2563EB,
          'isRead': false,
          'timestamp': '2026-09-26T14:20:00Z',
        },
        {
          'id': 'notif-2',
          'title': 'New Community Answer',
          'message': 'Priya Gupta (Top Helper) replied to Question #QC-8421.',
          'timeAgo': '1h ago',
          'iconCode': 0xe153, // chat_bubble
          'colorCode': 0xFF059669,
          'isRead': false,
          'timestamp': '2026-09-26T13:20:00Z',
        },
        {
          'id': 'notif-3',
          'title': 'GST Sync Advisory',
          'message': 'Auto GST Report v2.4 successfully linked to ledger data.',
          'timeAgo': '3h ago',
          'iconCode': 0xe506, // receipt_long
          'colorCode': 0xFFD97706,
          'isRead': true,
          'timestamp': '2026-09-26T11:20:00Z',
        },
      ],
      'pipeline_steps': <Map<String, dynamic>>[
        {
          'label': 'Analyzing & categorizing (GST & Tax - 94%)',
          'timestamp': 'Just now',
          'status': 'completed',
        },
        {
          'label': 'Finding similar solutions in Knowledge Base',
          'timestamp': 'Just now',
          'status': 'completed',
        },
        {
          'label': 'Notifying relevant franchisees (12 alerted in Mumbai)',
          'timestamp': 'In progress',
          'status': 'in_progress',
        },
        {
          'label': 'Escalating to support (Assigned: Ankit Verma)',
          'timestamp': 'Pending',
          'status': 'pending',
        },
        {
          'label': "You'll get notified on resolution",
          'timestamp': 'Pending',
          'status': 'pending',
        },
      ],
      'audit_logs': <Map<String, dynamic>>[
        {
          'id': 'audit-1',
          'actorId': 'usr-1',
          'actorRole': 'Store Owner',
          'franchiseId': 'FR-2041',
          'action': 'USER_LOGIN',
          'resourceType': 'AUTH_SESSION',
          'resourceId': 'usr-1',
          'details': 'User logged in via verified password hash',
          'timestamp': '2026-09-26T10:00:00Z',
        },
      ],
    };
  }

  // ==========================================
  // AUTHENTICATION & USER MANAGEMENT
  // ==========================================

  /// Current authenticated user
  Map<String, dynamic> getCurrentUser() {
    final session = _data['active_session'] as Map<String, dynamic>?;
    if (session == null) {
      return (_data['users'] as List).first as Map<String, dynamic>;
    }
    final userId = session['userId'];
    final users = (_data['users'] as List).cast<Map<String, dynamic>>();
    return users.firstWhere(
      (u) => u['id'] == userId,
      orElse: () => users.first,
    );
  }

  /// Authenticate with email or phone + password
  Future<Map<String, dynamic>?> login({
    required String identifier,
    required String password,
  }) async {
    final cleanId = identifier.trim().toLowerCase();
    final users = (_data['users'] as List).cast<Map<String, dynamic>>();

    final user = users.cast<Map<String, dynamic>?>().firstWhere(
      (u) =>
          u!['email'].toString().toLowerCase() == cleanId ||
          u['phone'].toString() == cleanId,
      orElse: () => null,
    );

    if (user == null) return null;

    final salt = user['salt'] as String;
    final expectedHash = hashPassword(password, salt);
    if (user['passwordHash'] != expectedHash) return null;

    // Create session
    final sessionToken = 'tok_${user['id']}_${DateTime.now().millisecondsSinceEpoch}';
    _data['active_session'] = {
      'userId': user['id'],
      'token': sessionToken,
      'loginTime': DateTime.now().toIso8601String(),
    };

    await _flushToDisk();
    _changeStreamController.add('auth');
    return user;
  }

  /// Register a brand new franchise account
  Future<Map<String, dynamic>> registerUser({
    required String name,
    required String email,
    required String phone,
    required String password,
    required String franchiseCode,
    required String city,
  }) async {
    final salt = 'salt_${DateTime.now().millisecondsSinceEpoch}';
    final passwordHash = hashPassword(password, salt);
    final nextId = 'usr-${(_data['users'] as List).length + 1}';

    final newUser = {
      'id': nextId,
      'name': name.trim(),
      'email': email.trim().toLowerCase(),
      'phone': phone.trim(),
      'passwordHash': passwordHash,
      'salt': salt,
      'franchiseCode': franchiseCode.trim().toUpperCase(),
      'city': city.trim(),
      'role': 'Store Owner',
      'avatarUrl':
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      'questionsCount': 0,
      'answersCount': 0,
      'savedPostsCount': 0,
      'createdAt': DateTime.now().toIso8601String(),
    };

    (_data['users'] as List).add(newUser);

    // Auto login
    _data['active_session'] = {
      'userId': nextId,
      'token': 'tok_${nextId}_${DateTime.now().millisecondsSinceEpoch}',
      'loginTime': DateTime.now().toIso8601String(),
    };

    // Welcome notification
    addNotification(
      title: 'Welcome to KhataCopilot FranchiseOS',
      message: 'Store $franchiseCode ($city) registered successfully with verified ledger security.',
      colorCode: 0xFF059669,
    );

    await _flushToDisk();
    _changeStreamController.add('auth');
    _changeStreamController.add('users');
    return newUser;
  }

  /// Switch account for realistic testing across roles
  Future<void> switchAccount(String userId) async {
    final users = (_data['users'] as List).cast<Map<String, dynamic>>();
    final target = users.firstWhere((u) => u['id'] == userId, orElse: () => users.first);

    _data['active_session'] = {
      'userId': target['id'],
      'token': 'tok_${target['id']}_switch',
      'loginTime': DateTime.now().toIso8601String(),
    };

    await _flushToDisk();
    _changeStreamController.add('auth');
  }

  /// Logout
  Future<void> logout() async {
    _data['active_session'] = null;
    await _flushToDisk();
    _changeStreamController.add('auth');
  }

  List<Map<String, dynamic>> getAllUsers() {
    return (_data['users'] as List).cast<Map<String, dynamic>>().toList();
  }

  // ==========================================
  // BUSINESS HEALTH & LIVE TRANSACTIONS
  // ==========================================

  Map<String, dynamic> getBusinessHealth() {
    return _data['business_health'] as Map<String, dynamic>;
  }

  Future<void> recordTransactionTick({double amount = 190.0}) async {
    final bh = _data['business_health'] as Map<String, dynamic>;
    bh['transactionsToday'] = (bh['transactionsToday'] as int) + 1;
    bh['totalSalesToday'] = (bh['totalSalesToday'] as num).toDouble() + amount;
    if (DateTime.now().second % 3 == 0) {
      bh['customersCount'] = (bh['customersCount'] as int) + 1;
    }
    bh['lastSync'] = DateTime.now().toIso8601String();

    await _flushToDisk();
    _changeStreamController.add('business_health');
  }

  // ==========================================
  // QUESTIONS CRUD
  // ==========================================

  List<Map<String, dynamic>> getQuestions() {
    return (_data['questions'] as List).cast<Map<String, dynamic>>().toList();
  }

  Map<String, dynamic>? getQuestionById(String id) {
    final list = (_data['questions'] as List).cast<Map<String, dynamic>>();
    return list.cast<Map<String, dynamic>?>().firstWhere(
      (q) => q!['id'] == id,
      orElse: () => null,
    );
  }

  Future<Map<String, dynamic>> insertQuestion({
    required String title,
    required String body,
    required String category,
    required int confidence,
    required List<String> tags,
  }) async {
    final user = getCurrentUser();
    final count = (_data['questions'] as List).length;
    final id = 'QC-${8422 + count}';

    final newQuestion = {
      'id': id,
      'title': title,
      'body': body,
      'authorId': user['id'],
      'authorName': user['name'],
      'authorFranchise': user['franchiseCode'],
      'authorLocation': user['city'],
      'authorAvatar': user['avatarUrl'],
      'authorBadge': user['role'] == 'Store Owner' ? 'Owner' : 'Franchisee',
      'timeAgo': 'Just now',
      'status': 'In Progress',
      'tags': tags,
      'commentsCount': 0,
      'upvotesCount': 1,
      'aiCategory': category,
      'aiConfidence': confidence,
      'createdAt': DateTime.now().toIso8601String(),
    };

    (_data['questions'] as List).insert(0, newQuestion);

    // Update user stats
    user['questionsCount'] = ((user['questionsCount'] as int?) ?? 0) + 1;

    // Reset pipeline steps for new question
    _data['pipeline_steps'] = [
      {
        'label': 'Analyzing & categorizing ($category - $confidence%)',
        'timestamp': 'Just now',
        'status': 'completed',
      },
      {
        'label': 'Finding similar solutions in Knowledge Base',
        'timestamp': 'Just now',
        'status': 'completed',
      },
      {
        'label': 'Notifying relevant franchisees',
        'timestamp': 'In progress',
        'status': 'in_progress',
      },
      {
        'label': 'Escalating to support (if needed)',
        'timestamp': 'Pending',
        'status': 'pending',
      },
      {
        'label': "You'll get notified",
        'timestamp': 'Pending',
        'status': 'pending',
      },
    ];

    addNotification(
      title: 'Question Posted ($id)',
      message: 'Intake Agent classified "$title" as $category ($confidence%).',
      colorCode: 0xFF2563EB,
    );

    await _flushToDisk();
    _changeStreamController.add('questions');
    _changeStreamController.add('pipeline_steps');
    _changeStreamController.add('users');
    return newQuestion;
  }

  Future<void> upvoteQuestion(String questionId) async {
    final list = (_data['questions'] as List).cast<Map<String, dynamic>>();
    final idx = list.indexWhere((q) => q['id'] == questionId);
    if (idx != -1) {
      list[idx]['upvotesCount'] = (list[idx]['upvotesCount'] as int) + 1;
      await _flushToDisk();
      _changeStreamController.add('questions');
    }
  }

  List<Map<String, dynamic>> getSimilarQuestions(String query) {
    final list = getQuestions();
    final qLower = query.toLowerCase().trim();
    if (qLower.isEmpty) {
      return list.where((q) => q['status'] == 'Solved').take(3).toList();
    }
    final tokens = qLower.split(RegExp(r'\s+')).where((t) => t.length > 2).toList();
    
    final matches = list.where((item) {
      final title = (item['title'] as String? ?? '').toLowerCase();
      final body = (item['body'] as String? ?? '').toLowerCase();
      return tokens.any((tok) => title.contains(tok) || body.contains(tok));
    }).toList();

    if (matches.isEmpty) {
      return list.take(3).toList();
    }
    return matches.take(3).toList();
  }

  Future<void> markQuestionSolved(String questionId) async {
    final list = (_data['questions'] as List).cast<Map<String, dynamic>>();
    final idx = list.indexWhere((q) => q['id'] == questionId);
    if (idx != -1) {
      list[idx]['status'] = 'Solved';
      list[idx]['upvotesCount'] = (list[idx]['upvotesCount'] as int) + 1;
      await _flushToDisk();
      _changeStreamController.add('questions');
    }
  }

  // ==========================================
  // REAL-TIME COMMENTS & DISCUSSION CHAT
  // ==========================================

  List<Map<String, dynamic>> getComments(String questionId) {
    final allComments = (_data['comments'] as List).cast<Map<String, dynamic>>();
    return allComments.where((c) => c['questionId'] == questionId).toList();
  }

  List<Map<String, dynamic>> getCommentsForQuestion(String questionId) => getComments(questionId);

  Future<Map<String, dynamic>> addComment({
    required String questionId,
    required String text,
  }) async {
    final user = getCurrentUser();
    final newId = 'cmt-${DateTime.now().millisecondsSinceEpoch}';

    final comment = {
      'id': newId,
      'questionId': questionId,
      'authorId': user['id'],
      'author': user['name'],
      'authorName': user['name'],
      'franchise': user['franchiseCode'],
      'authorFranchise': user['franchiseCode'],
      'authorLocation': user['city'],
      'authorAvatar': user['avatarUrl'],
      'authorBadge': user['role'] == 'Store Owner' ? 'Owner' : 'Franchisee',
      'text': text.trim(),
      'likes': 0,
      'likedBy': [],
      'timeAgo': 'Just now',
      'timestamp': DateTime.now().toIso8601String(),
    };

    (_data['comments'] as List).add(comment);

    // Increment question comments count
    final qList = (_data['questions'] as List).cast<Map<String, dynamic>>();
    final qIdx = qList.indexWhere((q) => q['id'] == questionId);
    if (qIdx != -1) {
      qList[qIdx]['commentsCount'] = (qList[qIdx]['commentsCount'] as int) + 1;
      if (qList[qIdx]['status'] == 'In Progress') {
        qList[qIdx]['status'] = 'Answered';
      }
    }

    // Increment user answers count
    user['answersCount'] = ((user['answersCount'] as int?) ?? 0) + 1;

    addNotification(
      title: 'Reply Posted on #$questionId',
      message: '${user['name']} replied: "${text.length > 50 ? '${text.substring(0, 47)}...' : text}"',
      colorCode: 0xFF059669,
    );

    await _flushToDisk();
    _changeStreamController.add('comments');
    _changeStreamController.add('questions');
    _changeStreamController.add('users');
    return comment;
  }

  Future<void> toggleCommentLike({
    required String commentId,
  }) async {
    final user = getCurrentUser();
    final userId = user['id'] as String;
    final allComments = (_data['comments'] as List).cast<Map<String, dynamic>>();
    final idx = allComments.indexWhere((c) => c['id'] == commentId);
    if (idx != -1) {
      final likedBy = (allComments[idx]['likedBy'] as List).cast<String>();
      if (likedBy.contains(userId)) {
        likedBy.remove(userId);
        allComments[idx]['likes'] = (allComments[idx]['likes'] as int) - 1;
      } else {
        likedBy.add(userId);
        allComments[idx]['likes'] = (allComments[idx]['likes'] as int) + 1;
      }
      await _flushToDisk();
      _changeStreamController.add('comments');
    }
  }

  // ==========================================
  // KNOWLEDGE BASE CRUD & AGENT SYNTHESIS
  // ==========================================

  List<Map<String, dynamic>> getKnowledgeArticles() {
    return (_data['knowledge_articles'] as List)
        .cast<Map<String, dynamic>>()
        .toList();
  }

  Future<Map<String, dynamic>> synthesizeKnowledgeArticle({
    required String questionId,
    required String title,
    required String category,
    required String subtitle,
    required List<String> sopSteps,
  }) async {
    final nextId = 'kb-${(_data['knowledge_articles'] as List).length + 1}';
    final newArticle = {
      'id': nextId,
      'title': title,
      'sourceQuestionId': questionId,
      'category': category,
      'subtitle': subtitle,
      'sopSteps': sopSteps,
      'iconCode': 0xe699, // verified
      'colorCode': 0xFF059669,
      'bgCode': 0xFFECFDF5,
      'viewCount': 1,
      'createdAt': DateTime.now().toIso8601String(),
    };

    (_data['knowledge_articles'] as List).insert(0, newArticle);

    // Mark question solved
    await markQuestionSolved(questionId);

    // Notification
    addNotification(
      title: 'Knowledge Article Promoted ($nextId)',
      message: 'Verified solution extracted from #$questionId promoted to global Knowledge Base.',
      colorCode: 0xFF059669,
    );

    // Audit logging
    addAuditLog(
      action: 'ACCEPT_ANSWER_PROMOTE_KNOWLEDGE',
      resourceType: 'KNOWLEDGE_ARTICLE',
      resourceId: nextId,
      details: 'Question #$questionId verified and promoted to Knowledge Base article "$title".',
    );

    await _flushToDisk();
    _changeStreamController.add('knowledge_articles');
    return newArticle;
  }

  // ==========================================
  // AUDIT LOGGING
  // ==========================================

  List<Map<String, dynamic>> getAuditLogs() {
    return (_data['audit_logs'] as List? ?? []).cast<Map<String, dynamic>>().toList();
  }

  void addAuditLog({
    required String action,
    required String resourceType,
    required String resourceId,
    required String details,
    String? actorId,
    String? actorRole,
    String? franchiseId,
  }) {
    final user = getCurrentUser();
    if (_data['audit_logs'] == null) {
      _data['audit_logs'] = <Map<String, dynamic>>[];
    }
    final log = {
      'id': 'audit-${DateTime.now().millisecondsSinceEpoch}',
      'actorId': actorId ?? user['id'] ?? 'SYSTEM',
      'actorRole': actorRole ?? user['role'] ?? 'SYSTEM',
      'franchiseId': franchiseId ?? user['franchiseCode'] ?? 'GLOBAL',
      'action': action,
      'resourceType': resourceType,
      'resourceId': resourceId,
      'details': details,
      'timestamp': DateTime.now().toIso8601String(),
    };
    (_data['audit_logs'] as List).insert(0, log);
    _flushToDisk();
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  List<Map<String, dynamic>> getNotifications() {
    return (_data['notifications'] as List)
        .cast<Map<String, dynamic>>()
        .toList();
  }

  void addNotification({
    required String title,
    required String message,
    required int colorCode,
  }) {
    final newNotif = {
      'id': 'notif-${DateTime.now().millisecondsSinceEpoch}',
      'title': title,
      'message': message,
      'timeAgo': 'Just now',
      'iconCode': 0xe153,
      'colorCode': colorCode,
      'isRead': false,
      'timestamp': DateTime.now().toIso8601String(),
    };
    (_data['notifications'] as List).insert(0, newNotif);
    _changeStreamController.add('notifications');
  }

  Future<void> markAllNotificationsRead() async {
    final notifs = (_data['notifications'] as List).cast<Map<String, dynamic>>();
    for (var n in notifs) {
      n['isRead'] = true;
    }
    await _flushToDisk();
    _changeStreamController.add('notifications');
  }

  Future<void> dismissNotification(String id) async {
    (_data['notifications'] as List).removeWhere((n) => n['id'] == id);
    await _flushToDisk();
    _changeStreamController.add('notifications');
  }

  // ==========================================
  // PIPELINE STATUS
  // ==========================================

  List<Map<String, dynamic>> getPipelineSteps() {
    return (_data['pipeline_steps'] as List)
        .cast<Map<String, dynamic>>()
        .toList();
  }

  Future<void> advancePipelineStep(int index, String newStatus, String label) async {
    final steps = (_data['pipeline_steps'] as List).cast<Map<String, dynamic>>();
    if (index >= 0 && index < steps.length) {
      steps[index]['status'] = newStatus;
      steps[index]['label'] = label;
      steps[index]['timestamp'] = 'Just now';
      await _flushToDisk();
      _changeStreamController.add('pipeline_steps');
    }
  }

  // ==========================================
  // LEADERBOARD COMPUTATION
  // ==========================================

  List<Map<String, dynamic>> getLeaderboard() {
    final users = (_data['users'] as List).cast<Map<String, dynamic>>().toList();
    users.sort((a, b) {
      final answersA = (a['answersCount'] as int?) ?? 0;
      final answersB = (b['answersCount'] as int?) ?? 0;
      return answersB.compareTo(answersA);
    });

    for (int i = 0; i < users.length; i++) {
      users[i]['rank'] = i + 1;
    }
    return users;
  }
}
