import unittest
from unittest.mock import patch
from xml.etree import ElementTree

from build_github_stats import language_card, match_count, stats_card


def text_nodes(markup):
    return [node.text for node in ElementTree.fromstring(markup).findall(".//{*}text")]


class GitHubStatsTests(unittest.TestCase):
    def test_languages_count_public_source_repositories_by_primary_language(self):
        repos = [
            {"language": "TypeScript", "fork": False},
            {"language": "C++", "fork": False},
            {"language": "C++", "fork": False},
            {"language": "Rust", "fork": True},
            {"language": None, "fork": False},
        ]
        nodes = text_nodes(language_card(repos, "2026-11-21"))
        self.assertEqual(nodes[1:-1], ["C++", "2", "TypeScript", "1"])
        self.assertIn("2026-11-21", nodes[-1])

    def test_no_classified_languages(self):
        self.assertEqual(len(text_nodes(language_card([], "2026-11-21"))), 2)

    def test_stats_preserve_labels_and_format_totals(self):
        nodes = text_nodes(stats_card([("PRs & issues", 1234)], "2026-11-21"))
        self.assertEqual(nodes[1:3], ["PRs & issues", "1,234"])

    @patch("build_github_stats.github", return_value={"incomplete_results": True})
    def test_incomplete_search_does_not_generate_a_misleading_count(self, _github):
        with self.assertRaises(RuntimeError):
            match_count("is:public is:pr")


if __name__ == "__main__":
    unittest.main()
