import 'dart:async';
import 'package:flutter/material.dart';
import '../models/app_models.dart';
import '../theme/app_theme.dart';
import '../services/app_state.dart';

class AskQuestionScreen extends StatefulWidget {
  final Function(ScreenType) onNavigate;
  final String questionText;
  final Function(String) onQuestionChanged;

  const AskQuestionScreen({
    super.key,
    required this.onNavigate,
    required this.questionText,
    required this.onQuestionChanged,
  });

  @override
  State<AskQuestionScreen> createState() => _AskQuestionScreenState();
}

class _AskQuestionScreenState extends State<AskQuestionScreen> {
  late TextEditingController _controller;
  bool _hasScreenshot = false;
  bool _hasVideo = false;
  bool _hasFile = false;
  bool _isListeningVoice = false;
  bool _isPosting = false;
  String _selectedCategory = 'AI Auto-Detect';

  final List<String> _categories = [
    'AI Auto-Detect',
    'GST & Tax',
    'Voice Entry',
    'Device Setup',
    'Inventory',
    'Payments',
    'Troubleshooting',
    'Business Growth',
  ];

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.questionText);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _simulateVoiceInput() {
    setState(() => _isListeningVoice = true);
    Timer(const Duration(milliseconds: 1400), () {
      if (!mounted) return;
      final voiceTranscriptions = [
        'Invoice generate karne par GSTR-1 total match nahi ho raha. Purchase entry sync kaise karein?',
        'Bluetooth thermal printer se receipt print nahi ho rahi. Connection drops repeatedly.',
        'Barcode scanner se naya stock inventory me auto-add kaise karein?',
      ];
      final picked = voiceTranscriptions[DateTime.now().second % voiceTranscriptions.length];
      setState(() {
        _isListeningVoice = false;
        _controller.text = picked;
      });
      widget.onQuestionChanged(picked);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Transcribed voice input via KhataCopilot Speech AI (Hindi/English)'),
          duration: Duration(seconds: 2),
          backgroundColor: Color(0xFF2563EB),
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bgLight,
      appBar: AppBar(
        title: const Text('Ask a Question'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => widget.onNavigate(ScreenType.community),
        ),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 600),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Section 1: Describe issue + Voice Assistant
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Describe your issue',
                                  style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w800,
                                    color: AppTheme.textMain,
                                  ),
                                ),
                                SizedBox(height: 2),
                                Text(
                                  'AI will categorize & route to relevant experts.',
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: AppTheme.textMuted,
                                  ),
                                ),
                              ],
                            ),
                            InkWell(
                              onTap: _isListeningVoice ? null : _simulateVoiceInput,
                              borderRadius: BorderRadius.circular(12),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                decoration: BoxDecoration(
                                  color: _isListeningVoice ? const Color(0xFFFEE2E2) : const Color(0xFFEFF6FF),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: _isListeningVoice ? Colors.red : const Color(0xFFBFDBFE),
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      _isListeningVoice ? Icons.mic : Icons.mic_none,
                                      size: 16,
                                      color: _isListeningVoice ? Colors.red : AppTheme.primary,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      _isListeningVoice ? 'Listening...' : 'Voice Entry',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        color: _isListeningVoice ? Colors.red : AppTheme.primary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),

                        if (_isListeningVoice)
                          Container(
                            margin: const EdgeInsets.only(bottom: 8),
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFEF2F2),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFFECACA)),
                            ),
                            child: const Row(
                              children: [
                                SizedBox(
                                  width: 14,
                                  height: 14,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.red),
                                ),
                                SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    'Listening in Hindi / Hinglish... speak clearly now',
                                    style: TextStyle(fontSize: 11, color: Colors.red, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ],
                            ),
                          ),

                        Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppTheme.borderMedium),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              TextField(
                                controller: _controller,
                                maxLines: 5,
                                maxLength: 500,
                                onChanged: (val) {
                                  widget.onQuestionChanged(val);
                                  setState(() {});
                                },
                                style: const TextStyle(fontSize: 13, height: 1.4),
                                decoration: const InputDecoration(
                                  hintText: 'Describe what happened in detail or tap Voice Entry...',
                                  border: InputBorder.none,
                                  contentPadding: EdgeInsets.all(12),
                                  counterText: '',
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.only(right: 12.0, bottom: 8.0),
                                child: Text(
                                  '${_controller.text.length}/500',
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.textSubtle,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Section 2: Choose Topic Category (Optional Override)
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Topic Category',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                                color: AppTheme.textMain,
                              ),
                            ),
                            Text(
                              _selectedCategory == 'AI Auto-Detect' ? 'Auto-routed by Groq AI' : 'Manual Tag',
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.primary,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: _categories.map((cat) {
                              final isSelected = _selectedCategory == cat;
                              return Padding(
                                padding: const EdgeInsets.only(right: 6.0),
                                child: ChoiceChip(
                                  label: Text(cat),
                                  selected: isSelected,
                                  onSelected: (val) {
                                    if (val) setState(() => _selectedCategory = cat);
                                  },
                                  selectedColor: const Color(0xFFDBEAFE),
                                  backgroundColor: Colors.white,
                                  labelStyle: TextStyle(
                                    fontSize: 11,
                                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                                    color: isSelected ? AppTheme.primary : AppTheme.textMuted,
                                  ),
                                  side: BorderSide(
                                    color: isSelected ? AppTheme.primary : AppTheme.borderMedium,
                                  ),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                ),
                              );
                            }).toList(),
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Section 3: Add details & attachments
                        const Text(
                          'Add details (optional)',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.textMain,
                          ),
                        ),
                        const SizedBox(height: 8),

                        Row(
                          children: [
                            _attachmentButton(
                              icon: Icons.camera_alt_outlined,
                              label: _hasScreenshot ? 'Screenshot Added' : 'Add Screenshot',
                              isActive: _hasScreenshot,
                              onTap: () {
                                setState(() => _hasScreenshot = !_hasScreenshot);
                              },
                            ),
                            const SizedBox(width: 8),
                            _attachmentButton(
                              icon: Icons.videocam_outlined,
                              label: _hasVideo ? 'Video Added' : 'Add Video',
                              isActive: _hasVideo,
                              onTap: () {
                                setState(() => _hasVideo = !_hasVideo);
                              },
                            ),
                            const SizedBox(width: 8),
                            _attachmentButton(
                              icon: Icons.attach_file_rounded,
                              label: _hasFile ? 'Log Attached' : 'Add File',
                              isActive: _hasFile,
                              onTap: () {
                                setState(() => _hasFile = !_hasFile);
                              },
                            ),
                          ],
                        ),

                        // Interactive Attached Files Card
                        if (_hasScreenshot || _hasVideo || _hasFile) ...[
                          const SizedBox(height: 10),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFBFDBFE)),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Attached Diagnostics:',
                                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMuted),
                                ),
                                const SizedBox(height: 6),
                                if (_hasScreenshot)
                                  _fileAttachmentItem(
                                    icon: Icons.image_outlined,
                                    name: 'gstr1_sales_register_error.png',
                                    size: '1.2 MB',
                                    onDelete: () => setState(() => _hasScreenshot = false),
                                  ),
                                if (_hasVideo)
                                  _fileAttachmentItem(
                                    icon: Icons.videocam_outlined,
                                    name: 'bluetooth_thermal_printer_disconnect.mp4',
                                    size: '4.8 MB',
                                    onDelete: () => setState(() => _hasVideo = false),
                                  ),
                                if (_hasFile)
                                  _fileAttachmentItem(
                                    icon: Icons.description_outlined,
                                    name: 'pos_ledger_audit_sync.log',
                                    size: '340 KB',
                                    onDelete: () => setState(() => _hasFile = false),
                                  ),
                              ],
                            ),
                          ),
                        ],
                        const SizedBox(height: 16),

                        // Section 4: AI Feature highlight box
                        Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEFF6FF),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFDBEAFE)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Row(
                                children: [
                                  Icon(Icons.auto_awesome, color: AppTheme.primary, size: 16),
                                  SizedBox(width: 6),
                                  Text(
                                    'Groq LPU AI will automatically detect',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w800,
                                      color: Color(0xFF1E40AF),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              _bulletPoint('Category & Subcategory with high confidence'),
                              _bulletPoint('Priority & SLA escalation rating'),
                              _bulletPoint('Relevant certified franchise experts nearby'),
                              _bulletPoint('Instant solutions from Franchise Knowledge Base'),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Post Button
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: _isPosting
                        ? null
                        : () async {
                            final text = _controller.text.trim();
                            if (text.isEmpty) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Please describe your issue or record voice input first.'),
                                  backgroundColor: Colors.red,
                                ),
                              );
                              return;
                            }

                            final messenger = ScaffoldMessenger.of(context);
                            setState(() => _isPosting = true);
                            try {
                              final title = text.contains('\n')
                                  ? text.split('\n').first
                                  : (text.length > 70 ? '${text.substring(0, 67)}...' : text);

                              final customTags = _selectedCategory != 'AI Auto-Detect'
                                  ? [_selectedCategory]
                                  : null;

                              await AppState.instance.postNewQuestion(
                                title: title,
                                body: text,
                                tags: customTags,
                              );

                              if (!mounted) return;
                              _controller.clear();
                              widget.onQuestionChanged('');
                              setState(() {
                                _hasScreenshot = false;
                                _hasVideo = false;
                                _hasFile = false;
                                _isPosting = false;
                              });

                              widget.onNavigate(ScreenType.analyzing);
                            } catch (e) {
                              if (mounted) {
                                setState(() => _isPosting = false);
                                messenger.showSnackBar(
                                  SnackBar(
                                    content: Text('Failed to post question: $e'),
                                    backgroundColor: Colors.red,
                                  ),
                                );
                              }
                            }
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                      elevation: 4,
                    ),
                    child: _isPosting
                        ? const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                ),
                              ),
                              SizedBox(width: 10),
                              Text(
                                'Analyzing with Groq LPU AI...',
                                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                              ),
                            ],
                          )
                        : const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.send_rounded, size: 16),
                              SizedBox(width: 8),
                              Text(
                                'Post Question',
                                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _attachmentButton({
    required IconData icon,
    required String label,
    required bool isActive,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isActive ? const Color(0xFFEFF6FF) : Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isActive ? AppTheme.primary : AppTheme.borderMedium,
            ),
          ),
          child: Column(
            children: [
              Icon(icon, size: 20, color: isActive ? AppTheme.primary : AppTheme.textMuted),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: isActive ? AppTheme.primary : AppTheme.textMuted,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _bulletPoint(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2.0),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 4,
            decoration: const BoxDecoration(
              color: AppTheme.primary,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 8),
          Text(
            text,
            style: const TextStyle(
              fontSize: 11,
              color: Color(0xFF334155),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _fileAttachmentItem({
    required IconData icon,
    required String name,
    required String size,
    required VoidCallback onDelete,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppTheme.primary),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              name,
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMain),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          Text(
            size,
            style: const TextStyle(fontSize: 10, color: AppTheme.textSubtle),
          ),
          const SizedBox(width: 6),
          InkWell(
            onTap: onDelete,
            borderRadius: BorderRadius.circular(10),
            child: const Padding(
              padding: EdgeInsets.all(2.0),
              child: Icon(Icons.close_rounded, size: 14, color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }
}
