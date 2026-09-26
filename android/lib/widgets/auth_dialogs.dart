import 'package:flutter/material.dart';
import '../services/database_service.dart';
import '../services/app_state.dart';
import '../theme/app_theme.dart';

class AuthDialogs {
  /// Show Sign In Modal Bottom Sheet
  static void showSignIn(BuildContext context, {VoidCallback? onSuccess}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _SignInSheet(onSuccess: onSuccess),
    );
  }

  /// Show Register / Create Account Modal Bottom Sheet
  static void showSignUp(BuildContext context, {VoidCallback? onSuccess}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _SignUpSheet(onSuccess: onSuccess),
    );
  }

  /// Show Account Switcher Dialog (for testing multiple roles)
  static void showAccountSwitcher(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => const _AccountSwitcherSheet(),
    );
  }
}

class _SignInSheet extends StatefulWidget {
  final VoidCallback? onSuccess;
  const _SignInSheet({this.onSuccess});

  @override
  State<_SignInSheet> createState() => _SignInSheetState();
}

class _SignInSheetState extends State<_SignInSheet> {
  final _formKey = GlobalKey<FormState>();
  final _idController = TextEditingController(text: 'rajesh@store.khatacopilot.in');
  final _pwdController = TextEditingController(text: 'rajesh123');
  bool _obscureText = true;
  bool _isLoading = false;
  String? _errorMessage;

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final user = await DatabaseService.instance.login(
      identifier: _idController.text.trim(),
      password: _pwdController.text,
    );

    if (!mounted) return;

    if (user != null) {
      AppState.instance.syncFromDatabase();
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Welcome back, ${user['name']} (${user['franchiseCode']})!'),
          backgroundColor: AppTheme.emeraldSuccess,
        ),
      );
      widget.onSuccess?.call();
    } else {
      setState(() {
        _isLoading = false;
        _errorMessage = 'Invalid email/phone or password. Please try again.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: bottomInset + 20,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Franchise Sign In',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: AppTheme.textMain,
                        ),
                      ),
                      Text(
                        'Secure ledger authentication',
                        style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              if (_errorMessage != null)
                Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEE2E2),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFFECACA)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline, color: Colors.red, size: 16),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: const TextStyle(color: Colors.red, fontSize: 11),
                        ),
                      ),
                    ],
                  ),
                ),

              // Email / Phone Field
              const Text(
                'Email or Phone',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMain),
              ),
              const SizedBox(height: 6),
              TextFormField(
                controller: _idController,
                style: const TextStyle(fontSize: 13),
                decoration: InputDecoration(
                  hintText: 'e.g. rajesh@store.khatacopilot.in or 9876543210',
                  hintStyle: const TextStyle(fontSize: 12, color: AppTheme.textSubtle),
                  prefixIcon: const Icon(Icons.account_circle_outlined, size: 18),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                validator: (val) => val == null || val.trim().isEmpty ? 'Please enter email or phone' : null,
              ),
              const SizedBox(height: 14),

              // Password Field
              const Text(
                'Password',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMain),
              ),
              const SizedBox(height: 6),
              TextFormField(
                controller: _pwdController,
                obscureText: _obscureText,
                style: const TextStyle(fontSize: 13),
                decoration: InputDecoration(
                  hintText: 'Enter password',
                  hintStyle: const TextStyle(fontSize: 12, color: AppTheme.textSubtle),
                  prefixIcon: const Icon(Icons.lock_outline_rounded, size: 18),
                  suffixIcon: IconButton(
                    icon: Icon(_obscureText ? Icons.visibility_off : Icons.visibility, size: 18),
                    onPressed: () => setState(() => _obscureText = !_obscureText),
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                validator: (val) => val == null || val.length < 4 ? 'Password must be at least 4 chars' : null,
              ),
              const SizedBox(height: 16),

              // Submit Button
              SizedBox(
                width: double.infinity,
                height: 46,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleLogin,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Sign In', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 10),

              // Switch to Sign Up
              Center(
                child: TextButton(
                  onPressed: () {
                    Navigator.pop(context);
                    AuthDialogs.showSignUp(context, onSuccess: widget.onSuccess);
                  },
                  child: const Text('Need a store account? Create Account', style: TextStyle(fontSize: 12)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SignUpSheet extends StatefulWidget {
  final VoidCallback? onSuccess;
  const _SignUpSheet({this.onSuccess});

  @override
  State<_SignUpSheet> createState() => _SignUpSheetState();
}

class _SignUpSheetState extends State<_SignUpSheet> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _franchiseController = TextEditingController();
  final _cityController = TextEditingController();
  final _pwdController = TextEditingController();
  bool _obscureText = true;
  bool _isLoading = false;

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    try {
      final user = await DatabaseService.instance.registerUser(
        name: _nameController.text.trim(),
        email: _emailController.text.trim(),
        phone: _phoneController.text.trim(),
        password: _pwdController.text,
        franchiseCode: _franchiseController.text.trim(),
        city: _cityController.text.trim(),
      );

      if (!mounted) return;
      AppState.instance.syncFromDatabase();
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Account created for ${user['name']}! Signed in.'),
          backgroundColor: AppTheme.emeraldSuccess,
        ),
      );
      widget.onSuccess?.call();
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Registration error: $e'), backgroundColor: Colors.red),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      padding: EdgeInsets.only(
        left: 20,
        right: 20,
        top: 20,
        bottom: bottomInset + 20,
      ),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Create Store Account',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: AppTheme.textMain,
                        ),
                      ),
                      Text(
                        'Join KhataCopilot franchise network',
                        style: TextStyle(fontSize: 11, color: AppTheme.textMuted),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              _field('Owner / Manager Name', _nameController, 'Ramesh Patel', Icons.person_outline),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: _field('Franchise Code', _franchiseController, 'FR-4088', Icons.badge_outlined),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _field('Store City', _cityController, 'Pune Camp', Icons.location_on_outlined),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: _field('Email Address', _emailController, 'ramesh@pune.store', Icons.email_outlined),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _field('Mobile Phone', _phoneController, '9822001122', Icons.phone_outlined, isPhone: true),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // Password
              const Text(
                'Password',
                style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMain),
              ),
              const SizedBox(height: 4),
              TextFormField(
                controller: _pwdController,
                obscureText: _obscureText,
                style: const TextStyle(fontSize: 12),
                decoration: InputDecoration(
                  hintText: 'Minimum 6 characters',
                  hintStyle: const TextStyle(fontSize: 11, color: AppTheme.textSubtle),
                  prefixIcon: const Icon(Icons.lock_outline, size: 16),
                  suffixIcon: IconButton(
                    icon: Icon(_obscureText ? Icons.visibility_off : Icons.visibility, size: 16),
                    onPressed: () => setState(() => _obscureText = !_obscureText),
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
                validator: (val) => val == null || val.length < 6 ? 'Min 6 characters' : null,
              ),
              const SizedBox(height: 16),

              SizedBox(
                width: double.infinity,
                height: 46,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleRegister,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text('Register & Activate', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _field(String label, TextEditingController controller, String hint, IconData icon, {bool isPhone = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.textMain),
        ),
        const SizedBox(height: 4),
        TextFormField(
          controller: controller,
          keyboardType: isPhone ? TextInputType.phone : TextInputType.text,
          style: const TextStyle(fontSize: 12),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(fontSize: 11, color: AppTheme.textSubtle),
            prefixIcon: Icon(icon, size: 16),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
          ),
          validator: (val) => val == null || val.trim().isEmpty ? 'Required' : null,
        ),
      ],
    );
  }
}

class _AccountSwitcherSheet extends StatelessWidget {
  const _AccountSwitcherSheet();

  @override
  Widget build(BuildContext context) {
    final users = DatabaseService.instance.getAllUsers();
    final current = DatabaseService.instance.getCurrentUser();

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Switch Franchise Account',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: AppTheme.textMain),
                  ),
                  Text('Simulate interactions between stores and HQ', style: TextStyle(fontSize: 11, color: AppTheme.textMuted)),
                ],
              ),
              IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
            ],
          ),
          const SizedBox(height: 12),
          ...users.map((u) {
            final isCurrent = u['id'] == current['id'];
            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              decoration: BoxDecoration(
                color: isCurrent ? const Color(0xFFEFF6FF) : Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isCurrent ? AppTheme.primary : AppTheme.borderLight,
                  width: isCurrent ? 1.5 : 1,
                ),
              ),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundImage: NetworkImage(u['avatarUrl']),
                ),
                title: Text(
                  u['name'],
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppTheme.textMain),
                ),
                subtitle: Text(
                  '${u['franchiseCode']} • ${u['city']} (${u['role']})',
                  style: const TextStyle(fontSize: 11, color: AppTheme.textSubtle),
                ),
                trailing: isCurrent
                    ? const Icon(Icons.check_circle, color: AppTheme.primary, size: 20)
                    : const Icon(Icons.swap_horiz_rounded, color: AppTheme.textMuted),
                onTap: () async {
                  await DatabaseService.instance.switchAccount(u['id']);
                  AppState.instance.syncFromDatabase();
                  if (!context.mounted) return;
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Switched to ${u['name']} (${u['role']})'),
                      backgroundColor: AppTheme.primary,
                      duration: const Duration(seconds: 1),
                    ),
                  );
                },
              ),
            );
          }),
        ],
      ),
    );
  }
}
