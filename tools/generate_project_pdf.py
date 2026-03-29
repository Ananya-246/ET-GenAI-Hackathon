from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "PROJECT_FEATURE_IMPLEMENTATION_DOCUMENT.md"
OUT = ROOT / "ET_GenAI_Main_Feature_Implementation_Document.pdf"


def parse_markdown_lines(text):
    lines = []
    for raw in text.splitlines():
        line = raw.rstrip()
        if not line:
            lines.append(("blank", ""))
        elif line.startswith("# "):
            lines.append(("h1", line[2:].strip()))
        elif line.startswith("## "):
            lines.append(("h2", line[3:].strip()))
        elif line.startswith("### "):
            lines.append(("h3", line[4:].strip()))
        elif line.strip() == "---":
            lines.append(("rule", ""))
        elif line.startswith("- "):
            lines.append(("bullet", line[2:].strip()))
        elif line[:2].isdigit() and line[1:3] == ". ":
            lines.append(("number", line.strip()))
        else:
            lines.append(("text", line.strip()))
    return lines


def build_pdf():
    src_text = SRC.read_text(encoding="utf-8")
    parsed = parse_markdown_lines(src_text)

    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        rightMargin=1.6 * cm,
        leftMargin=1.6 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
        title="ET GenAI Main Feature Implementation Document",
        author="ET GenAI Team",
    )

    styles = getSampleStyleSheet()
    h1 = ParagraphStyle(
        "H1",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0D1B2A"),
        spaceAfter=8,
    )
    h2 = ParagraphStyle(
        "H2",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#1B263B"),
        spaceBefore=8,
        spaceAfter=6,
    )
    h3 = ParagraphStyle(
        "H3",
        parent=styles["Heading3"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=15,
        textColor=colors.HexColor("#27374D"),
        spaceBefore=6,
        spaceAfter=4,
    )
    body = ParagraphStyle(
        "Body",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#111111"),
        spaceAfter=3,
    )
    bullet = ParagraphStyle(
        "Bullet",
        parent=body,
        leftIndent=12,
        bulletIndent=4,
        spaceAfter=2,
    )

    story = []
    for kind, content in parsed:
        if kind == "blank":
            story.append(Spacer(1, 0.10 * cm))
        elif kind == "h1":
            story.append(Paragraph(content, h1))
        elif kind == "h2":
            story.append(Paragraph(content, h2))
        elif kind == "h3":
            story.append(Paragraph(content, h3))
        elif kind == "rule":
            story.append(Spacer(1, 0.18 * cm))
            story.append(Paragraph("<font color='#C1121F'>____________________________________________________________</font>", body))
            story.append(Spacer(1, 0.10 * cm))
        elif kind == "bullet":
            story.append(Paragraph(content, bullet, bulletText="-"))
        elif kind == "number":
            story.append(Paragraph(content, body))
        else:
            safe = content.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            story.append(Paragraph(safe, body))

    doc.build(story)


if __name__ == "__main__":
    build_pdf()
    print(f"PDF generated: {OUT}")
