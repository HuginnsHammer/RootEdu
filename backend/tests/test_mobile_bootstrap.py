from app.api.routes.mobile import build_mobile_bootstrap


def test_mobile_bootstrap_exposes_only_configured_must_pilot_programmes() -> None:
    payload = build_mobile_bootstrap()

    assert payload["product"] == "RootEdu"
    assert payload["institution"] == "Meru University of Science and Technology"
    assert payload["pilot"] == "MUST"
    assert {item["code"] for item in payload["programmes"]} == {"CT201", "CT204", "CT206"}
    assert payload["capabilities"]["authentication"] == "not_yet_available"
