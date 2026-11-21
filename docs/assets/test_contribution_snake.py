import unittest
from datetime import date
from pathlib import Path
from xml.etree import ElementTree


class ContributionSnakeTests(unittest.TestCase):
    def test_both_themes_show_the_same_complete_dated_public_calendar(self):
        grids = []
        for theme in ("light", "dark"):
            path = Path(__file__).with_name(f"contribution-snake-{theme}.svg")
            root = ElementTree.parse(path).getroot()
            self.assertIn("ChinmayShringi", root.findtext("{*}title"))
            description = root.findtext("{*}desc")
            date_range = description.split("Public calendar from ")[1].split(". ")[0]
            start, end = (date.fromisoformat(value) for value in date_range.split(" to "))
            grid = [(r.get("x"), r.get("y"), r.get("class")) for r in root.findall("{*}rect")
                    if r.get("class").split()[0] == "c"]
            self.assertGreaterEqual(len(grid), 365)
            self.assertEqual(len(grid), (end - start).days + 1)
            self.assertEqual(len(grid), len({(x, y) for x, y, _ in grid}))
            css = root.findtext("{*}style")
            self.assertIn("prefers-reduced-motion:reduce", css)
            self.assertIn("@keyframes s0", css)
            self.assertTrue(all(node.tag.rsplit("}", 1)[-1] in {"svg", "title", "desc", "style", "rect"}
                                for node in root.iter()))
            grids.append(grid)
        self.assertEqual(grids[0], grids[1])
