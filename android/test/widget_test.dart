import 'package:flutter_test/flutter_test.dart';
import 'package:khatacopilot_flutter/main.dart';

void main() {
  testWidgets('KhataCopilot app smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const KhataCopilotApp());
    expect(find.byType(KhataCopilotApp), findsOneWidget);
  });
}
