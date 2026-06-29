from backend.ai_engine import analyze_with_ai


def merge_with_ai(analysis_type, content, rule_result):
    """
    Runs the rule engine result through AI.
    Falls back to rule result if AI fails.
    """

    try:

        ai = analyze_with_ai(
            analysis_type,
            content,
            rule_result
        )

        if ai is None:
            return rule_result

        result = rule_result.copy()

        # AI additions
        result["ai"] = ai

        # Replace score if AI gives one
        if "risk_score" in ai:
            result["risk_score"] = ai["risk_score"]

        if "risk_level" in ai:
            result["risk_level"] = ai["risk_level"]

        # Merge flags
        if "extra_flags" in ai:

            existing = set(result.get("flags", []))

            existing.update(ai["extra_flags"])

            result["flags"] = sorted(existing)

        # Replace recommendations
        if "recommendations" in ai:

            result["recommendations"] = ai["recommendations"]

        # Nice explanation for frontend
        if "summary" in ai:

            result["ai_summary"] = ai["summary"]

        result["simple_explanation"] = ai.get(
            "simple_explanation",
            ""
        )

        return result

    except Exception as e:

        print("AI Merge Error:", e)

        return rule_result