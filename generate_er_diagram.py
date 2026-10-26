import os
from PIL import Image, ImageDraw, ImageFont

def create_er_diagram(output_path="er_diagram.png"):
    width = 2500
    height = 2000
    img = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(img)

    # Fonts
    font_path = "/System/Library/Fonts/Supplemental/Arial.ttf"
    title_font = ImageFont.truetype(font_path, 42)
    entity_font = ImageFont.truetype(font_path, 22)
    rel_font = ImageFont.truetype(font_path, 16)
    attr_font = ImageFont.truetype(font_path, 15)
    card_font = ImageFont.truetype(font_path, 18)
    name_font = ImageFont.truetype(font_path, 26)

    # 1. Title at top
    title_text = "Cricket Tournament Management System"
    bbox = draw.textbbox((0, 0), title_text, font=title_font)
    tw = bbox[2] - bbox[0]
    draw.text(((width - tw) // 2, 50), title_text, fill="black", font=title_font)

    # Helper: Draw Entity (Rectangle)
    def draw_entity(x, y, w, h, name):
        draw.rectangle([x - w // 2, y - h // 2, x + w // 2, y + h // 2], fill="white", outline="black", width=2)
        bbox = draw.textbbox((0, 0), name, font=entity_font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text((x - tw // 2, y - th // 2 - 2), name, fill="black", font=entity_font)
        return (x, y, w, h)

    # Helper: Draw Relationship (Diamond)
    def draw_relation(x, y, w, h, name):
        pts = [(x, y - h // 2), (x + w // 2, y), (x, y + h // 2), (x - w // 2, y)]
        draw.polygon(pts, fill="white", outline="black")
        draw.line(pts + [pts[0]], fill="black", width=2)
        bbox = draw.textbbox((0, 0), name, font=rel_font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text((x - tw // 2, y - th // 2 - 2), name, fill="black", font=rel_font)
        return (x, y, w, h)

    # Helper: Draw Attribute (Oval)
    def draw_attribute(x, y, text, is_pk=False):
        w = 175
        h = 42
        draw.ellipse([x - w // 2, y - h // 2, x + w // 2, y + h // 2], fill="white", outline="black", width=2)
        bbox = draw.textbbox((0, 0), text, font=attr_font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.text((x - tw // 2, y - th // 2 - 2), text, fill="black", font=attr_font)
        if is_pk:
            # Underline PK text
            draw.line([(x - tw // 2, y + th // 2 + 2), (x + tw // 2, y + th // 2 + 2)], fill="black", width=2)
        return (x, y, w, h)

    # Helper: Connect line with optional cardinality
    def connect(pt1, pt2, card1=None, card2=None):
        draw.line([pt1, pt2], fill="black", width=2)
        if card1:
            cx = pt1[0] + (pt2[0] - pt1[0]) * 0.25
            cy = pt1[1] + (pt2[1] - pt1[1]) * 0.25 - 14
            draw.text((cx, cy), card1, fill="black", font=card_font)
        if card2:
            cx = pt1[0] + (pt2[0] - pt1[0]) * 0.75
            cy = pt1[1] + (pt2[1] - pt1[1]) * 0.75 - 14
            draw.text((cx, cy), card2, fill="black", font=card_font)

    # Helper: Connect Attribute to Entity anchor
    def connect_attrs(anchor, attr_coords):
        for ac in attr_coords:
            draw.line([anchor, (ac[0], ac[1])], fill="black", width=2)

    # -------------------------------------------------------------
    # ENTITIES COORDINATES & DEFINITIONS
    # -------------------------------------------------------------
    # 1. CRICKET_STADIUM (Top-Left)
    stad_x, stad_y = 650, 220
    # 2. CRICKET_TEAM (Center-Top)
    team_x, team_y = 1250, 480
    # 3. TEAM_SPONSOR (Left of Team)
    spon_x, spon_y = 650, 750
    # 4. CRICKET_PLAYER (Right-Top)
    play_x, play_y = 1850, 480
    # 5. TOURNAMENT_MATCH (Center)
    matc_x, matc_y = 1250, 1020
    # 6. CRICKET_UMPIRE (Right of Match)
    umpi_x, umpi_y = 1850, 1020
    # 7. MATCH_SCORECARD (Center-Bottom)
    scor_x, scor_y = 1250, 1550

    # Draw Relations (Diamonds)
    r_host = (850, 620)
    r_spon = (950, 615)
    r_play = (1550, 480)
    r_part = (1250, 750)
    r_offi = (1550, 1020)
    r_gene = (1250, 1285)
    r_logg = (1600, 1285)

    # -------------------------------------------------------------
    # DRAW CONNECTING LINES FIRST (under entities)
    # -------------------------------------------------------------
    # Stadium -> HOSTS -> Match
    connect((stad_x, stad_y + 30), r_host, card1="1")
    connect(r_host, (matc_x - 120, matc_y - 20), card2="N")

    # Team -> SPONSORED_BY -> Sponsor
    connect((team_x - 110, team_y + 10), r_spon, card1="1")
    connect(r_spon, (spon_x + 110, spon_y - 10), card2="N")

    # Team -> HAS_PLAYERS -> Player
    connect((team_x + 110, team_y), (r_play[0] - 65, r_play[1]), card1="1")
    connect((r_play[0] + 65, r_play[1]), (play_x - 110, play_y), card2="N")

    # Team -> PARTICIPATES_IN -> Match
    connect((team_x, team_y + 30), (r_part[0], r_part[1] - 40), card1="M")
    connect((r_part[0], r_part[1] + 40), (matc_x, matc_y - 30), card2="N")

    # Match -> OFFICIATED_BY -> Umpire
    connect((matc_x + 115, matc_y), (r_offi[0] - 65, r_offi[1]), card1="M")
    connect((r_offi[0] + 65, r_offi[1]), (umpi_x - 110, umpi_y), card2="N")

    # Match -> GENERATES -> Scorecard
    connect((matc_x, matc_y + 30), (r_gene[0], r_gene[1] - 40), card1="1")
    connect((r_gene[0], r_gene[1] + 40), (scor_x, scor_y - 30), card2="N")

    # Player -> LOGGED_FOR -> Scorecard
    connect((play_x, play_y + 30), r_logg, card1="1")
    connect(r_logg, (scor_x + 120, scor_y), card2="N")

    # -------------------------------------------------------------
    # DRAW ATTRIBUTES FOR EACH ENTITY
    # -------------------------------------------------------------
    # Attributes for CRICKET_STADIUM (Top-Left, fanning left)
    stad_attrs = [
        draw_attribute(360, 140, "Stadium_ID (PK)", is_pk=True),
        draw_attribute(360, 195, "Stadium_Name"),
        draw_attribute(360, 250, "City"),
        draw_attribute(360, 305, "Capacity")
    ]
    connect_attrs((stad_x - 110, stad_y), stad_attrs)

    # Attributes for TEAM_SPONSOR (Middle-Left, fanning left)
    spon_attrs = [
        draw_attribute(360, 640, "Sponsor_ID (PK)", is_pk=True),
        draw_attribute(360, 695, "Sponsor_Name"),
        draw_attribute(360, 750, "Industry"),
        draw_attribute(360, 805, "Contract_Amount"),
        draw_attribute(360, 860, "Team_ID")
    ]
    connect_attrs((spon_x - 110, spon_y), spon_attrs)

    # Attributes for CRICKET_TEAM (Center-Top, fanning up/left)
    team_attrs = [
        draw_attribute(1020, 290, "Team_ID (PK)", is_pk=True),
        draw_attribute(1180, 290, "Team_Name"),
        draw_attribute(1340, 290, "Coach"),
        draw_attribute(1500, 290, "Home_Ground"),
        draw_attribute(1660, 290, "Owner")
    ]
    connect_attrs((team_x, team_y - 30), team_attrs)

    # Attributes for CRICKET_PLAYER (Top-Right, fanning right)
    play_attrs = [
        draw_attribute(2140, 315, "Player_ID (PK)", is_pk=True),
        draw_attribute(2140, 370, "Player_Name"),
        draw_attribute(2140, 425, "Age"),
        draw_attribute(2140, 480, "Role"),
        draw_attribute(2140, 535, "Nationality"),
        draw_attribute(2140, 590, "Jersey_No"),
        draw_attribute(2140, 645, "Team_ID")
    ]
    connect_attrs((play_x + 110, play_y), play_attrs)

    # Attributes for CRICKET_UMPIRE (Middle-Right, fanning right)
    umpi_attrs = [
        draw_attribute(2140, 910, "Umpire_ID (PK)", is_pk=True),
        draw_attribute(2140, 965, "Umpire_Name"),
        draw_attribute(2140, 1020, "Country"),
        draw_attribute(2140, 1075, "Experience")
    ]
    connect_attrs((umpi_x + 110, umpi_y), umpi_attrs)

    # Attributes for TOURNAMENT_MATCH (Center, fanning left)
    matc_attrs = [
        draw_attribute(900, 940, "Match_ID (PK)", is_pk=True),
        draw_attribute(900, 995, "Match_Date"),
        draw_attribute(900, 1050, "Match_Type"),
        draw_attribute(900, 1105, "Result"),
        draw_attribute(900, 1160, "Stadium_ID")
    ]
    connect_attrs((matc_x - 110, matc_y), matc_attrs)

    # Attributes for MATCH_SCORECARD (Bottom, fanning left and right)
    scor_attrs_l = [
        draw_attribute(880, 1470, "Scorecard_ID (PK)", is_pk=True),
        draw_attribute(880, 1525, "Runs"),
        draw_attribute(880, 1580, "Balls_Faced"),
        draw_attribute(880, 1635, "Wickets")
    ]
    scor_attrs_r = [
        draw_attribute(1620, 1470, "Overs"),
        draw_attribute(1620, 1525, "Player_ID"),
        draw_attribute(1620, 1580, "Match_ID")
    ]
    connect_attrs((scor_x - 110, scor_y), scor_attrs_l)
    connect_attrs((scor_x + 110, scor_y), scor_attrs_r)

    # -------------------------------------------------------------
    # DRAW ENTITIES (Rectangles with white fill)
    # -------------------------------------------------------------
    draw_entity(stad_x, stad_y, 220, 60, "CRICKET_STADIUM")
    draw_entity(team_x, team_y, 220, 60, "CRICKET_TEAM")
    draw_entity(spon_x, spon_y, 220, 60, "TEAM_SPONSOR")
    draw_entity(play_x, play_y, 220, 60, "CRICKET_PLAYER")
    draw_entity(matc_x, matc_y, 230, 60, "TOURNAMENT_MATCH")
    draw_entity(umpi_x, umpi_y, 220, 60, "CRICKET_UMPIRE")
    draw_entity(scor_x, scor_y, 240, 60, "MATCH_SCORECARD")

    # -------------------------------------------------------------
    # DRAW RELATIONSHIPS (Diamonds with white fill)
    # -------------------------------------------------------------
    draw_relation(r_host[0], r_host[1], 130, 75, "HOSTS")
    draw_relation(r_spon[0], r_spon[1], 150, 75, "SPONSORED_BY")
    draw_relation(r_play[0], r_play[1], 140, 75, "HAS_PLAYERS")
    draw_relation(r_part[0], r_part[1], 160, 80, "PARTICIPATES_IN")
    draw_relation(r_offi[0], r_offi[1], 150, 75, "OFFICIATED_BY")
    draw_relation(r_gene[0], r_gene[1], 140, 75, "GENERATES")
    draw_relation(r_logg[0], r_logg[1], 140, 75, "LOGS_FOR")

    # -------------------------------------------------------------
    # NAMES AT BOTTOM (Exact match to friend's document)
    # -------------------------------------------------------------
    names_line1 = "Name: Raunak Kwatra"
    names_line2 = "Kartikey Aggarwal"
    draw.text((1120, 1820), names_line1, fill="black", font=name_font)
    draw.text((1195, 1860), names_line2, fill="black", font=name_font)

    # Save image
    img.save(output_path, "PNG", dpi=(300, 300))
    print(f"ER diagram successfully generated at: {output_path}")

if __name__ == "__main__":
    create_er_diagram("/Users/raunakkwatra/Desktop/CRICKETTOURNAMENT/er_diagram.png")
