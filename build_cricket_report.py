import zipfile
import html
import os
import io
from PIL import Image

TEMPLATE_PATH = '/Users/raunakkwatra/.gemini/antigravity/brain/32b7a23b-8425-4491-8b87-b291fd8f590e/.user_uploaded/media_1792357146244_a87cce36.docx'
OUTPUT_PATH = '/Users/raunakkwatra/Desktop/CRICKETTOURNAMENT/CricketBuddy_Project_Report.docx'

def escape(text):
    if text is None:
        return ""
    return html.escape(str(text))

def make_para(text, bold=False, italic=False, center=False, right=False, justify=False, font_size=24, space_after=120, space_before=0, indent=0, color="000000"):
    align_xml = ""
    if center:
        align_xml = '<w:jc w:val="center"/>'
    elif right:
        align_xml = '<w:jc w:val="right"/>'
    elif justify:
        align_xml = '<w:jc w:val="both"/>'

    ind_xml = f'<w:ind w:left="{indent}"/>' if indent > 0 else ""
    rpr = ['<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>']
    if bold:
        rpr.append('<w:b/><w:bCs/>')
    if italic:
        rpr.append('<w:i/><w:iCs/>')
    if font_size != 24:
        rpr.append(f'<w:sz w:val="{font_size}"/><w:szCs w:val="{font_size}"/>')
    if color != "000000":
        rpr.append(f'<w:color w:val="{color}"/>')
    
    rpr_str = "".join(rpr)
    escaped_text = escape(text)

    return f"""<w:p>
  <w:pPr>
    {align_xml}
    {ind_xml}
    <w:spacing w:before="{space_before}" w:after="{space_after}" w:line="276" w:lineRule="auto"/>
    <w:rPr>{rpr_str}</w:rPr>
  </w:pPr>
  <w:r>
    <w:rPr>{rpr_str}</w:rPr>
    <w:t xml:space="preserve">{escaped_text}</w:t>
  </w:r>
</w:p>"""

def make_heading1(text):
    return f"""<w:p>
  <w:pPr>
    <w:spacing w:before="320" w:after="140" w:line="280" w:lineRule="auto"/>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
      <w:b/><w:bCs/>
      <w:sz w:val="32"/><w:szCs w:val="32"/>
      <w:color w:val="0F172A"/>
    </w:rPr>
  </w:pPr>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
      <w:b/><w:bCs/>
      <w:sz w:val="32"/><w:szCs w:val="32"/>
      <w:color w:val="0F172A"/>
    </w:rPr>
    <w:t>{escape(text)}</w:t>
  </w:r>
</w:p>"""

def make_heading2(text):
    return f"""<w:p>
  <w:pPr>
    <w:spacing w:before="220" w:after="100" w:line="260" w:lineRule="auto"/>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
      <w:b/><w:bCs/>
      <w:sz w:val="26"/><w:szCs w:val="26"/>
      <w:color w:val="1E293B"/>
    </w:rPr>
  </w:pPr>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
      <w:b/><w:bCs/>
      <w:sz w:val="26"/><w:szCs w:val="26"/>
      <w:color w:val="1E293B"/>
    </w:rPr>
    <w:t>{escape(text)}</w:t>
  </w:r>
</w:p>"""

def make_heading3(text):
    return f"""<w:p>
  <w:pPr>
    <w:ind w:left="240"/>
    <w:spacing w:before="160" w:after="80" w:line="240" w:lineRule="auto"/>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
      <w:b/><w:bCs/>
      <w:sz w:val="24"/><w:szCs w:val="24"/>
      <w:color w:val="334155"/>
    </w:rPr>
  </w:pPr>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
      <w:b/><w:bCs/>
      <w:sz w:val="24"/><w:szCs w:val="24"/>
      <w:color w:val="334155"/>
    </w:rPr>
    <w:t>{escape(text)}</w:t>
  </w:r>
</w:p>"""

def make_body_p(text, indent=0):
    return make_para(text, bold=False, justify=True, font_size=24, space_after=120, indent=indent, color="1E293B")

def make_page_break():
    return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'

def make_toc_item(title, page_num, is_heading=False, is_sub=False):
    indent_xml = ""
    font_weight_xml = "<w:b/><w:bCs/>" if is_heading else ""
    color_val = "0F172A" if is_heading else "334155"
    sz_val = "22"
    
    if is_sub:
        indent_xml = '<w:ind w:left="360"/>'
    elif is_heading:
        sz_val = "23"

    return f"""<w:p>
  <w:pPr>
    {indent_xml}
    <w:tabs>
      <w:tab w:val="right" w:leader="dot" w:pos="9360"/>
    </w:tabs>
    <w:spacing w:before="30" w:after="30" w:line="240" w:lineRule="auto"/>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
      {font_weight_xml}
      <w:sz w:val="{sz_val}"/><w:szCs w:val="{sz_val}"/>
      <w:color w:val="{color_val}"/>
    </w:rPr>
  </w:pPr>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
      {font_weight_xml}
      <w:sz w:val="{sz_val}"/><w:szCs w:val="{sz_val}"/>
      <w:color w:val="{color_val}"/>
    </w:rPr>
    <w:t>{escape(title)}</w:t>
  </w:r>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
      {font_weight_xml}
      <w:sz w:val="{sz_val}"/><w:szCs w:val="{sz_val}"/>
      <w:color w:val="{color_val}"/>
    </w:rPr>
    <w:tab/>
    <w:t>{escape(page_num)}</w:t>
  </w:r>
</w:p>"""

def make_table(headers, rows, col_widths=None):
    if not col_widths:
        w = 9000 // len(headers)
        col_widths = [w] * len(headers)
    
    grid_xml = "".join([f'<w:gridCol w:w="{cw}"/>' for cw in col_widths])
    
    # Header Row
    hdr_cells = []
    for i, h in enumerate(headers):
        cw = col_widths[i]
        hdr_cells.append(f"""<w:tc>
          <w:tcPr>
            <w:tcW w:w="{cw}" w:type="dxa"/>
            <w:shd w:val="clear" w:color="auto" w:fill="E2E8F0"/>
            <w:tcMar><w:top w:w="120" w:type="dxa"/><w:bottom w:w="120" w:type="dxa"/><w:left w:w="140" w:type="dxa"/><w:right w:w="140" w:type="dxa"/></w:tcMar>
          </w:tcPr>
          <w:p>
            <w:pPr><w:jc w:val="center"/><w:spacing w:before="60" w:after="60"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:bCs/><w:sz w:val="21"/><w:szCs w:val="21"/><w:color w:val="0F172A"/></w:rPr></w:pPr>
            <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:b/><w:bCs/><w:sz w:val="21"/><w:szCs w:val="21"/><w:color w:val="0F172A"/></w:rPr><w:t>{escape(h)}</w:t></w:r>
          </w:p>
        </w:tc>""")
    
    hdr_row = f'<w:tr><w:trPr><w:tblHeader/></w:trPr>{"".join(hdr_cells)}</w:tr>'
    
    # Body Rows
    body_rows = []
    for r_idx, r in enumerate(rows):
        shd = ' w:fill="F8FAFC"' if r_idx % 2 == 1 else ' w:fill="FFFFFF"'
        cells = []
        for i, val in enumerate(r):
            cw = col_widths[i]
            jc = "center" if i in [0, 1, 2] else "left"
            cells.append(f"""<w:tc>
              <w:tcPr>
                <w:tcW w:w="{cw}" w:type="dxa"/>
                <w:shd w:val="clear" w:color="auto"{shd}/>
                <w:tcMar><w:top w:w="80" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/><w:left w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar>
              </w:tcPr>
              <w:p>
                <w:pPr><w:jc w:val="{jc}"/><w:spacing w:before="40" w:after="40"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="20"/><w:szCs w:val="20"/><w:color w:val="1E293B"/></w:rPr></w:pPr>
                <w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="20"/><w:szCs w:val="20"/><w:color w:val="1E293B"/></w:rPr><w:t>{escape(val)}</w:t></w:r>
              </w:p>
            </w:tc>""")
        body_rows.append(f'<w:tr>{"".join(cells)}</w:tr>')
    
    tbl_xml = f"""<w:tbl>
      <w:tblPr>
        <w:tblStyle w:val="TableGrid"/>
        <w:tblW w:w="0" w:type="auto"/>
        <w:jc w:val="center"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/>
          <w:left w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/>
          <w:bottom w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/>
          <w:right w:val="single" w:sz="6" w:space="0" w:color="94A3B8"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
          <w:insideV w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tblGrid>{grid_xml}</w:tblGrid>
      {hdr_row}
      {"".join(body_rows)}
    </w:tbl>"""
    return tbl_xml

def make_image_xml(r_id, cx, cy, title, fig_id, fig_title):
    doc_id = abs(hash(fig_id)) % 100000000
    return f"""<w:p>
  <w:pPr><w:jc w:val="center"/><w:spacing w:before="140" w:after="80"/></w:pPr>
  <w:r>
    <w:drawing>
      <wp:inline distT="0" distB="0" distL="0" distR="0">
        <wp:extent cx="{cx}" cy="{cy}"/>
        <wp:effectExtent l="0" t="0" r="0" b="0"/>
        <wp:docPr id="{doc_id}" name="{escape(title)}"/>
        <wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr>
        <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
          <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
            <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
              <pic:nvPicPr><pic:cNvPr id="0" name="{escape(title)}"/><pic:cNvPicPr/></pic:nvPicPr>
              <pic:blipFill><a:blip r:embed="{r_id}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>
              <pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>
            </pic:pic>
          </a:graphicData>
        </a:graphic>
      </wp:inline>
    </w:drawing>
  </w:r>
</w:p>
<w:p>
  <w:pPr>
    <w:jc w:val="center"/>
    <w:spacing w:before="60" w:after="200"/>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
      <w:b/><w:bCs/>
      <w:sz w:val="21"/><w:szCs w:val="21"/>
      <w:color w:val="1E293B"/>
    </w:rPr>
  </w:pPr>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
      <w:b/><w:bCs/>
      <w:sz w:val="21"/><w:szCs w:val="21"/>
      <w:color w:val="1E293B"/>
    </w:rPr>
    <w:t>{escape(fig_id)}: {escape(fig_title)}</w:t>
  </w:r>
</w:p>"""

def build_full_document_xml():
    p = []
    
    # -------------------------------------------------------------
    # COVER PAGE
    # -------------------------------------------------------------
    logo_xml = """<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="160"/></w:pPr><w:r><w:rPr><w:noProof/></w:rPr><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="4183380" cy="1150824"/><wp:effectExtent l="0" t="0" r="7620" b="0"/><wp:docPr id="481182226" name="Picture 1" descr="Manipal University Jaipur"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="Picture 1" descr="Manipal University"/><pic:cNvPicPr><a:picLocks noChangeAspect="1" noChangeArrowheads="1"/></pic:cNvPicPr></pic:nvPicPr><pic:blipFill><a:blip r:embed="rId7" cstate="print"><a:extLst><a:ext uri="{28A0092B-C50C-407E-A947-70E740481C1C}"><a14:useLocalDpi xmlns:a14="http://schemas.microsoft.com/office/drawing/2010/main" val="0"/></a:ext></a:extLst></a:blip><a:srcRect/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr bwMode="auto"><a:xfrm><a:off x="0" y="0"/><a:ext cx="4239345" cy="1166220"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln><a:noFill/></a:ln></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>"""
    p.append(logo_xml)
    
    p.append(make_para("Cricket Tournament Management System (CricketBuddy)", bold=True, center=True, font_size=36, space_before=200, space_after=80, color="0F172A"))
    p.append(make_para("PROJECT REPORT", bold=True, center=True, font_size=28, space_after=140, color="1E3A8A"))
    p.append(make_para("Submitted in partial fulfillment of the requirements for the laboratory course of", italic=True, center=True, font_size=22, space_after=40))
    p.append(make_para("Relational Database Management Systems Laboratory (CS2102)", bold=True, center=True, font_size=24, space_after=200))
    
    # Student & Supervisor Table
    p.append(f"""<w:tbl>
      <w:tblPr>
        <w:tblW w:w="9200" w:type="dxa"/>
        <w:jc w:val="center"/>
        <w:tblBorders>
          <w:top w:val="none"/><w:left w:val="none"/><w:bottom w:val="none"/><w:right w:val="none"/><w:insideH w:val="none"/><w:insideV w:val="none"/>
        </w:tblBorders>
      </w:tblPr>
      <w:tblGrid><w:gridCol w:w="4600"/><w:gridCol w:w="4600"/></w:tblGrid>
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="4600" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="left"/><w:spacing w:after="60"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="23"/><w:color w:val="0F172A"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="23"/><w:color w:val="0F172A"/></w:rPr><w:t>Submitted By:</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="left"/><w:spacing w:after="40"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/><w:color w:val="1E293B"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/><w:color w:val="1E293B"/></w:rPr><w:t>Raunak Kwatra</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="left"/><w:spacing w:after="60"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="21"/><w:color w:val="475569"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="21"/><w:color w:val="475569"/></w:rPr><w:t>Reg. No: 2502050081</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="left"/><w:spacing w:after="40"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/><w:color w:val="1E293B"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/><w:color w:val="1E293B"/></w:rPr><w:t>Kartikey Aggarwal</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="left"/><w:spacing w:after="40"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="21"/><w:color w:val="475569"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="21"/><w:color w:val="475569"/></w:rPr><w:t>Reg. No: 2502050082</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="4600" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="right"/><w:spacing w:after="60"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="23"/><w:color w:val="0F172A"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="23"/><w:color w:val="0F172A"/></w:rPr><w:t>Under the Supervision of:</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="right"/><w:spacing w:after="40"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="24"/><w:color w:val="1E3A8A"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="24"/><w:color w:val="1E3A8A"/></w:rPr><w:t>Dr. Onkar Singh</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="right"/><w:spacing w:after="40"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="21"/><w:color w:val="475569"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="21"/><w:color w:val="475569"/></w:rPr><w:t>Assistant Professor (Senior Scale)</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="right"/><w:spacing w:after="40"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="21"/><w:color w:val="475569"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="21"/><w:color w:val="475569"/></w:rPr><w:t>Department of CSE</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
    </w:tbl>""")
    
    p.append(make_para("Department of Computer Science and Engineering", bold=True, center=True, font_size=24, space_before=240, space_after=40, color="0F172A"))
    p.append(make_para("Manipal University Jaipur", bold=True, center=True, font_size=26, space_after=40, color="1E3A8A"))
    p.append(make_para("Dehmi Kalan, Near GVK Toll Plaza, Jaipur-Ajmer Expressway, Jaipur, Rajasthan 303007", center=True, font_size=20, space_after=60, color="475569"))
    p.append(make_para("B.Tech Computer Science and Engineering — 3rd Semester", bold=True, center=True, font_size=22, space_after=30))
    p.append(make_para("Academic Session: 2026–2027", center=True, font_size=20, space_after=120))
    
    p.append(make_page_break())
    
    # -------------------------------------------------------------
    # CERTIFICATE OF ORIGINALITY
    # -------------------------------------------------------------
    p.append(make_heading1("Certificate of Recommendation"))
    p.append(make_body_p("This is to certify that the project report entitled \"Cricket Tournament Management System (CricketBuddy)\" submitted by Raunak Kwatra (Registration No: 2502050081) and Kartikey Aggarwal (Registration No: 2502050082) in partial fulfillment of the academic requirements for the Relational Database Management Systems Laboratory (CS2102) of Bachelor of Technology in Computer Science and Engineering at Manipal University Jaipur, is a bonafide record of the design, normalization, development, and testing work carried out under my direct supervision."))
    p.append(make_body_p("The database schema design, normalized relations (satisfying Boyce-Codd Normal Form), Express REST API backend, and responsive frontend interface presented in this report have reached the standard of academic and engineering competence required by the Department."))
    p.append(make_body_p("To the best of my knowledge, the matter embodied in this report has not been submitted to any other University or Institution for the award of any degree or diploma."))
    
    # Signatures
    p.append(f"""<w:tbl>
      <w:tblPr><w:tblW w:w="9200" w:type="dxa"/><w:jc w:val="center"/><w:tblBorders><w:top w:val="none"/><w:left w:val="none"/><w:bottom w:val="none"/><w:right w:val="none"/><w:insideH w:val="none"/><w:insideV w:val="none"/></w:tblBorders></w:tblPr>
      <w:tblGrid><w:gridCol w:w="4600"/><w:gridCol w:w="4600"/></w:tblGrid>
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="4600" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:spacing w:before="600" w:after="40"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr><w:t>Dr. Onkar Singh</w:t></w:r></w:p>
          <w:p><w:pPr><w:spacing w:after="20"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="20"/><w:color w:val="475569"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="20"/><w:color w:val="475569"/></w:rPr><w:t>Project Supervisor</w:t></w:r></w:p>
          <w:p><w:pPr><w:spacing w:after="20"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="20"/><w:color w:val="475569"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="20"/><w:color w:val="475569"/></w:rPr><w:t>Department of CSE, MUJ</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="4600" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="right"/><w:spacing w:before="600" w:after="40"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr><w:t>Head of Department</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="right"/><w:spacing w:after="20"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="20"/><w:color w:val="475569"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="20"/><w:color w:val="475569"/></w:rPr><w:t>Department of Computer Science &amp; Engg.</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="right"/><w:spacing w:after="20"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="20"/><w:color w:val="475569"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="20"/><w:color w:val="475569"/></w:rPr><w:t>Manipal University Jaipur</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
    </w:tbl>""")
    
    p.append(make_page_break())
    
    # -------------------------------------------------------------
    # CANDIDATE'S DECLARATION
    # -------------------------------------------------------------
    p.append(make_heading1("Candidate's Declaration"))
    p.append(make_body_p("We hereby declare that the project report entitled \"Cricket Tournament Management System (CricketBuddy)\" submitted to the Department of Computer Science and Engineering, Manipal University Jaipur, is an authentic record of our own research and software engineering work carried out during the Autumn 2026 semester."))
    p.append(make_body_p("We confirm that:"))
    p.append(make_body_p("1. The work has been done by us independently under the mentorship of our faculty supervisor, Dr. Onkar Singh.", indent=360))
    p.append(make_body_p("2. All sources of code, theoretical references, textbooks, and documentation manuals have been duly acknowledged.", indent=360))
    p.append(make_body_p("3. The schema and application code have not formed the basis for the award of any other degree, diploma, or fellowship at this or any other institution.", indent=360))
    
    p.append(f"""<w:tbl>
      <w:tblPr><w:tblW w:w="9200" w:type="dxa"/><w:jc w:val="center"/><w:tblBorders><w:top w:val="none"/><w:left w:val="none"/><w:bottom w:val="none"/><w:right w:val="none"/><w:insideH w:val="none"/><w:insideV w:val="none"/></w:tblBorders></w:tblPr>
      <w:tblGrid><w:gridCol w:w="4600"/><w:gridCol w:w="4600"/></w:tblGrid>
      <w:tr>
        <w:tc>
          <w:tcPr><w:tcW w:w="4600" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:spacing w:before="400" w:after="40"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr><w:t>Raunak Kwatra</w:t></w:r></w:p>
          <w:p><w:pPr><w:spacing w:after="20"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="20"/><w:color w:val="475569"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="20"/><w:color w:val="475569"/></w:rPr><w:t>Registration No: 2502050081</w:t></w:r></w:p>
        </w:tc>
        <w:tc>
          <w:tcPr><w:tcW w:w="4600" w:type="dxa"/></w:tcPr>
          <w:p><w:pPr><w:jc w:val="right"/><w:spacing w:before="400" w:after="40"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:b/><w:sz w:val="22"/></w:rPr><w:t>Kartikey Aggarwal</w:t></w:r></w:p>
          <w:p><w:pPr><w:jc w:val="right"/><w:spacing w:after="20"/><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="20"/><w:color w:val="475569"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="20"/><w:color w:val="475569"/></w:rPr><w:t>Registration No: 2502050082</w:t></w:r></w:p>
        </w:tc>
      </w:tr>
    </w:tbl>""")
    
    p.append(make_page_break())

    # -------------------------------------------------------------
    # ACKNOWLEDGEMENT
    # -------------------------------------------------------------
    p.append(make_heading1("Acknowledgement"))
    p.append(make_body_p("We express our profound gratitude to our project supervisor, Dr. Onkar Singh, Assistant Professor (Senior Scale), Department of Computer Science and Engineering, Manipal University Jaipur, for his invaluable guidance, technical insights, and continuous encouragement throughout the conception, modeling, and realization of the Cricket Tournament Management System."))
    p.append(make_body_p("We are deeply thankful to the Head of Department, Computer Science and Engineering, for providing world-class laboratory facilities, database infrastructure, and a conducive academic environment."))
    p.append(make_body_p("We extend our heartfelt appreciation to our peers, families, and friends whose unwavering moral support and feedback enabled us to complete this project successfully."))
    
    p.append(make_page_break())
    
    # -------------------------------------------------------------
    # ABSTRACT
    # -------------------------------------------------------------
    p.append(make_heading1("Abstract"))
    p.append(make_body_p("The Cricket Tournament Management System (CricketBuddy) is an enterprise-grade, database-driven web application architected to streamline and modernize the administrative workflows of professional cricket leagues, championships, and collegiate tournaments. The principal objective of this system is to deliver a centralized, secure, and interactive management portal coordinating nine critical operational entities: franchise teams, stadiums and host venues, squad players, certified match umpires, tournament fixtures, commercial sponsorships, match scorecards, team participations, and officiating referees."))
    p.append(make_body_p("The foundational layer uses MySQL 9.7 as the Relational Database Management System (RDBMS) under the database catalog CricketTournamentDB. The database schema has been engineered strictly adhering to relational algebra, third normal form (3NF), and Boyce-Codd normal form (BCNF). It establishes primary keys, composite keys, cascading foreign key constraints, and integrity rules that guarantee consistency and eliminate deletion and update anomalies across tournament operations."))
    p.append(make_body_p("The service layer is powered by Node.js and Express.js, providing an asynchronous RESTful API architecture connecting client interactions to the MySQL database engine through an optimized connection pool. The presentation layer is built with modern HTML5, CSS3, dynamic JavaScript, and Lucide icons, offering a responsive user interface with live global search, dynamic statistical filtering, theme toggle (dark/light), and a SheetForge-inspired dual-mode role-based access control (RBAC). In this architecture, administrators authenticate via a secure master password to unlock complete CRUD capabilities, while viewers enter their identity details to browse rosters, fixtures, valuations, and match scorecards in a safe read-only environment."))
    p.append(make_body_p("This project demonstrates practical mastery over relational database principles including Entity-Relationship (ER) modeling, multi-table JOINs, aggregation functions, subqueries, referential integrity cascading, and full-stack API integration."))
    p.append(make_para("Keywords: Relational Database Management System (RDBMS), MySQL 9.7, Boyce-Codd Normal Form (BCNF), Entity-Relationship (ER) Modeling, RESTful API, Express.js, Cricket Tournament Administration, Role-Based Access Control (RBAC).", italic=True, font_size=22, space_before=140))
    
    p.append(make_page_break())
    
    # -------------------------------------------------------------
    # TABLE OF CONTENTS
    # -------------------------------------------------------------
    p.append(make_heading1("Table of Contents"))
    toc_items = [
        ("Abstract", "iv", True, False),
        ("List of Figures", "vi", True, False),
        ("List of Tables", "vii", True, False),
        ("Chapter 1: Introduction", "1", True, False),
        ("1.1 Project Overview", "1", False, True),
        ("1.2 Objectives of the Project", "2", False, True),
        ("1.3 Importance and Relevance", "2", False, True),
        ("1.4 Scope and Limitations", "3", False, True),
        ("Chapter 2: Literature Review", "4", True, False),
        ("2.1 Existing Cricket Tournament Systems", "4", False, True),
        ("2.2 Relevant Technologies", "4", False, True),
        ("2.2.1 MySQL Relational Database Management System", "4", False, True),
        ("2.2.2 Node.js and Express.js REST API Layer", "5", False, True),
        ("2.2.3 Vanilla JavaScript, HTML5, CSS3 and Lucide Icons", "5", False, True),
        ("2.3 Summary", "6", False, True),
        ("Chapter 3: System Design", "7", True, False),
        ("3.1 Database Design Overview", "7", False, True),
        ("3.2 Entity-Relationship (ER) Diagram", "7", False, True),
        ("3.3 Description of Tables and Attributes", "8", False, True),
        ("3.4 Database Normalization", "12", False, True),
        ("3.5 Limitations of Normalization", "14", False, True),
        ("Chapter 4: Implementation and Screenshots", "15", True, False),
        ("4.1 Overview", "15", False, True),
        ("4.2 Database Implementation", "15", False, True),
        ("4.3 Tournament Overview Dashboard", "17", False, True),
        ("4.4 Team Management and Franchises", "18", False, True),
        ("4.5 Player Squad Roster and Athlete Profiles", "19", False, True),
        ("4.6 Tournament Matches and Fixture Scheduling", "20", False, True),
        ("4.7 Match Scorecards and Performance Logs", "21", False, True),
        ("4.8 Stadiums and Host Venues", "22", False, True),
        ("4.9 Tournament Analytics and Aggregated Queries", "23", False, True),
        ("4.10 Commercial Team Sponsorships", "24", False, True),
        ("4.11 Certified Match Umpires and Referees", "25", False, True),
        ("4.12 Dual-Mode Authentication and Role-Based Access Control", "26", False, True),
        ("4.13 Live Global Search and Dropdown Filtering", "27", False, True),
        ("Chapter 5: Results and Discussion", "28", True, False),
        ("5.1 Presentation of Results", "28", False, True),
        ("5.2 Discussion of Findings", "28", False, True),
        ("5.3 Testing and Validation", "29", False, True),
        ("Chapter 6: Conclusion", "31", True, False),
        ("6.1 Summary of Project Work", "31", False, True),
        ("6.2 Achievement of Project Objectives", "31", False, True),
        ("6.3 Lessons Learned", "32", False, True),
        ("Chapter 7: Future Work", "33", True, False),
        ("7.1 Suggestions for Future Enhancements", "33", False, True),
        ("7.2 Areas for Further Research", "33", False, True),
        ("References", "34", True, False)
    ]
    for title, pg, is_h, is_s in toc_items:
        p.append(make_toc_item(title, pg, is_heading=is_h, is_sub=is_s))
        
    p.append(make_page_break())
    
    # -------------------------------------------------------------
    # LIST OF FIGURES & LIST OF TABLES
    # -------------------------------------------------------------
    p.append(make_heading1("List of Figures"))
    figs = [
        ("Figure 3.1", "Entity-Relationship (ER) Diagram for CricketTournamentDB", "8"),
        ("Figure 4.1", "MySQL Terminal Verification — SHOW TABLES in CricketTournamentDB", "15"),
        ("Figure 4.2", "MySQL Schema Structure — DESCRIBE CricketTeam and CricketPlayer", "16"),
        ("Figure 4.3", "CricketBuddy Tournament Executive Dashboard & KPI Metrics", "17"),
        ("Figure 4.4", "Team Management Roster & Franchise Profiles", "18"),
        ("Figure 4.5", "Player Squad Roster with Role Badges & Team Affiliations", "19"),
        ("Figure 4.6", "Tournament Matches & Fixture Scheduling Module", "20"),
        ("Figure 4.7", "Match Scorecards & Batting/Bowling Performance Tracking", "21"),
        ("Figure 4.8", "Stadiums and Host Venues Management Interface", "22"),
        ("Figure 4.9", "Tournament Analytics & Queries (Top Run Scorers, Squad Sizes, Sponsorships)", "23"),
        ("Figure 4.10", "Commercial Team Sponsorships & Contract Valuations View", "24"),
        ("Figure 4.11", "Certified Match Referees and Umpires Directory", "25"),
        ("Figure 4.12", "SheetForge-Style Dual-Mode Authentication Modal (Admin vs Viewer)", "26"),
        ("Figure 4.13", "Live Global Search & Real-Time Dropdown Filtering", "27")
    ]
    for fid, title, pg in figs:
        p.append(make_toc_item(f"{fid}: {title}", pg))
        
    p.append(make_para("", space_after=140))
    p.append(make_heading1("List of Tables"))
    tbls = [
        ("Table 3.1", "CricketTeam Table Schema", "9"),
        ("Table 3.2", "CricketStadium Table Schema", "9"),
        ("Table 3.3", "CricketPlayer Table Schema", "10"),
        ("Table 3.4", "CricketUmpire Table Schema", "10"),
        ("Table 3.5", "TournamentMatch Table Schema", "11"),
        ("Table 3.6", "TeamSponsor Table Schema", "11"),
        ("Table 3.7", "MatchScorecard Table Schema", "12"),
        ("Table 3.8", "TeamParticipation Table Schema", "12"),
        ("Table 3.9", "MatchOfficials Table Schema", "12")
    ]
    for tid, title, pg in tbls:
        p.append(make_toc_item(f"{tid}: {title}", pg))
        
    p.append(make_page_break())
    
    # -------------------------------------------------------------
    # CHAPTER 1: INTRODUCTION
    # -------------------------------------------------------------
    p.append(make_heading1("Chapter 1: Introduction"))
    p.append(make_heading2("1.1 Project Overview"))
    p.append(make_body_p("Cricket is celebrated as one of the most widely followed professional sports globally, engaging hundreds of franchises, thousands of athletic players, multimillion-dollar corporate sponsorships, and millions of passionate spectators. Organizing modern cricket tournaments—whether multi-tier domestic championships, premier leagues, or collegiate tournaments—demands the systematic coordination of interlinked operational data, including participating teams, player rosters, certified umpires, venues, match schedules, live scorecards, and sponsorship contracts."))
    p.append(make_body_p("Traditionally, tournament management in universities and local athletic boards relied upon decentralized spreadsheets, paper scorebooks, and disconnected manual record-keeping. These antiquated methodologies suffer from severe data redundancies, lack of concurrency control, arithmetic inconsistencies in player averages, loss of historical records, and security vulnerabilities."))
    p.append(make_body_p("To eliminate these challenges, the Cricket Tournament Management System (CricketBuddy) was conceived as a centralized, relational database-driven web platform. Developed using MySQL 9.7 as the primary RDBMS, an Express.js / Node.js backend server, and a high-performance interactive frontend interface, CricketBuddy provides automated record management, referential integrity, and transparent data exploration for both administrators and viewers."))
    
    repo_url = "https://github.com/raunakkwatra/CricketBuddy"
    p.append(make_para("Source Code & Repository:", bold=True, space_before=80, space_after=40))
    p.append(make_body_p("The complete source code, normalized SQL schema definitions, backend REST API routes, frontend controllers, and deployment configuration are maintained on GitHub:"))
    p.append(f"""<w:p>
  <w:pPr>
    <w:spacing w:before="40" w:after="160" w:line="276" w:lineRule="auto"/>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
    </w:rPr>
  </w:pPr>
  <w:r>
    <w:rPr>
      <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
      <w:b/><w:bCs/>
      <w:sz w:val="23"/><w:szCs w:val="23"/>
      <w:color w:val="0F172A"/>
    </w:rPr>
    <w:t>GitHub Repository: </w:t>
  </w:r>
  <w:hyperlink r:id="rId30" w:history="1">
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>
        <w:b/><w:bCs/>
        <w:u w:val="single"/>
        <w:sz w:val="23"/><w:szCs w:val="23"/>
        <w:color w:val="1E40AF"/>
      </w:rPr>
      <w:t>{repo_url}</w:t>
    </w:r>
  </w:hyperlink>
</w:p>""")
    
    p.append(make_heading2("1.2 Objectives of the Project"))
    p.append(make_body_p("The primary objectives established for the CricketBuddy system comprise:"))
    p.append(make_body_p("• To architect an authentic relational database schema normalized to BCNF under CricketTournamentDB, capturing 9 interrelated entities without data anomalies.", indent=360))
    p.append(make_body_p("• To design an expressive Chen-notation Entity-Relationship (ER) model identifying cardinality ratios (1:N, M:N) and primary/foreign key mappings.", indent=360))
    p.append(make_body_p("• To enforce database integrity through primary keys, composite keys, NOT NULL rules, CHECK constraints, and cascading foreign keys (ON DELETE CASCADE, ON DELETE SET NULL).", indent=360))
    p.append(make_body_p("• To build an asynchronous Node.js and Express.js REST API implementing parameterized CRUD operations across all tournament modules.", indent=360))
    p.append(make_body_p("• To construct a dual-mode role-based access control (RBAC) interface allowing administrators to manage records and viewers to browse data in read-only mode.", indent=360))
    p.append(make_body_p("• To deliver live global search filtering, theme toggling (dark/light), and analytical aggregations (top run-scorers, squad counts, commercial valuations).", indent=360))

    p.append(make_heading2("1.3 Importance and Relevance"))
    p.append(make_body_p("Managing a multi-franchise sports tournament involves complex financial and athletic logistics. High-precision financial contracts (e.g., Tata Steel $25,000,000,000.00 sponsorship) must be tracked alongside individual player batting strike rates and bowling figures without arithmetic inaccuracies. A normalized relational database guarantees that modifying a team's coach or stadium automatically reflects across all associated matches and rosters, eliminating manual re-entry."))

    p.append(make_heading2("1.4 Scope and Limitations"))
    p.append(make_body_p("The current implementation encompasses a functional local tournament management suite running on MySQL 9.7 and Node.js. Limitations include:"))
    p.append(make_body_p("• Offline / Single-Host Deployment: The current build is configured for local intranet hosting (localhost:3000) rather than a geo-distributed cloud cluster.", indent=360))
    p.append(make_body_p("• Match Simulation: Match outcomes are currently entered by certified umpires/administrators rather than pulled from external IoT ball-tracking radars.", indent=360))
    p.append(make_body_p("• Payment Gateway: Commercial sponsorship deals are recorded as ledger entries rather than integrated with live bank payment gateways.", indent=360))

    p.append(make_page_break())

    # -------------------------------------------------------------
    # CHAPTER 2: LITERATURE REVIEW
    # -------------------------------------------------------------
    p.append(make_heading1("Chapter 2: Literature Review"))
    p.append(make_heading2("2.1 Existing Cricket Tournament Systems"))
    p.append(make_body_p("Modern sports administration has shifted rapidly from manual paperwork to integrated digital scorekeeping systems such as Cricbuzz, ESPNcricinfo, and CricHeroes. While these commercial services offer vast international coverage, they operate as proprietary walled gardens unsuitable for collegiate athletic boards, regional leagues, and university tournaments that require custom governance rules, sponsorship ledgers, and venue allocation tools."))
    
    p.append(make_heading2("2.2 Relevant Technologies"))
    p.append(make_heading3("2.2.1 MySQL Relational Database Management System"))
    p.append(make_body_p("MySQL is an industry-leading open-source RDBMS renowned for ACID compliance (Atomicity, Consistency, Isolation, Durability), reliable InnoDB storage engine, multi-version concurrency control (MVCC), and structured query optimization. In CricketBuddy, MySQL 9.7 manages the 9 core relations, indexing primary and foreign keys for instantaneous join lookups."))

    p.append(make_heading3("2.2.2 Node.js and Express.js REST API Layer"))
    p.append(make_body_p("Node.js provides an asynchronous, event-driven JavaScript runtime ideal for I/O-intensive database operations. Express.js acts as the server framework, exposing REST endpoints (/api/teams, /api/players, /api/stadiums, /api/matches, /api/scorecards, /api/sponsors, /api/umpires, /api/statistics). It utilizes the mysql2 connection pool with parameterized queries to prevent SQL injection."))

    p.append(make_heading3("2.2.3 Vanilla JavaScript, HTML5, CSS3 and Lucide Icons"))
    p.append(make_body_p("The presentation tier is engineered using vanilla ES6+ JavaScript, semantic HTML5, modern CSS3 with custom variables, and offline-bundled Lucide SVG icons. This ensures sub-50ms DOM rendering, zero build-step overhead, and smooth responsiveness across desktop and mobile devices."))

    p.append(make_heading2("2.3 Summary"))
    p.append(make_body_p("The integration of a normalized MySQL backend with an Express REST API and a responsive presentation frontend delivers a resilient, secure, and intuitive tournament governance suite that addresses the shortcomings of legacy manual scorekeeping."))

    p.append(make_page_break())

    # -------------------------------------------------------------
    # CHAPTER 3: SYSTEM DESIGN
    # -------------------------------------------------------------
    p.append(make_heading1("Chapter 3: System Design"))
    p.append(make_heading2("3.1 Database Design Overview"))
    p.append(make_body_p("The design of CricketTournamentDB follows standard relational database lifecycle principles: conceptual entity identification, cardinality mapping, relational schema decomposition, and BCNF verification. The system represents 9 entities linked via 1-to-many and many-to-many relationships."))

    p.append(make_heading2("3.2 Entity-Relationship (ER) Diagram"))
    p.append(make_body_p("Figure 3.1 depicts the formal Entity-Relationship diagram in Chen's notation. Entities are shown as rectangles, attributes as ovals (primary keys underlined), relationships as diamonds, and associative tables as double diamonds."))
    
    # ER Diagram (rId8 in template -> image2.png)
    p.append(make_image_xml("rId8", 5486400, 3550000, "ER Diagram", "Figure 3.1", "Entity-Relationship (ER) Diagram for CricketTournamentDB (Chen's Notation)"))

    p.append(make_heading2("3.3 Description of Tables and Attributes"))
    p.append(make_body_p("The physical relational schema comprises nine normalized tables:"))
    
    # Table 3.1
    p.append(make_para("Table 3.1: CricketTeam Table Schema", bold=True, space_before=140, space_after=60))
    p.append(make_table(
        ["Field", "Type", "Key", "Description"],
        [
            ["TeamID", "INT", "PRI", "Unique team identifier; auto-incremented primary key."],
            ["TeamName", "VARCHAR(100)", "UNI", "Official franchise name; unique and mandatory."],
            ["Coach", "VARCHAR(100)", "", "Head coach name overseeing athletic strategy."],
            ["HomeGround", "VARCHAR(100)", "", "Designated home venue of the franchise."],
            ["Owner", "VARCHAR(100)", "", "Corporate owner or franchise consortium."]
        ],
        [1600, 2000, 1400, 4000]
    ))

    # Table 3.2
    p.append(make_para("Table 3.2: CricketStadium Table Schema", bold=True, space_before=140, space_after=60))
    p.append(make_table(
        ["Field", "Type", "Key", "Description"],
        [
            ["StadiumID", "INT", "PRI", "Unique venue identifier; auto-incremented primary key."],
            ["StadiumName", "VARCHAR(100)", "UNI", "Official stadium name; mandatory."],
            ["City", "VARCHAR(50)", "", "Geographic host city location."],
            ["Capacity", "INT", "", "Spectator seating capacity (must be positive)."]
        ],
        [1600, 2000, 1400, 4000]
    ))

    # Table 3.3
    p.append(make_para("Table 3.3: CricketPlayer Table Schema", bold=True, space_before=140, space_after=60))
    p.append(make_table(
        ["Field", "Type", "Key", "Description"],
        [
            ["PlayerID", "INT", "PRI", "Unique athlete identifier; auto-incremented primary key."],
            ["PlayerName", "VARCHAR(100)", "", "Full name of the registered player."],
            ["Age", "INT", "", "Athlete age in years (must be between 15 and 50)."],
            ["Role", "VARCHAR(50)", "", "Specialization: Batsman, Bowler, All Rounder, Wicket Keeper."],
            ["Nationality", "VARCHAR(50)", "", "Country of international citizenship."],
            ["JerseyNo", "INT", "", "Official jersey squad number."],
            ["TeamID", "INT", "FK", "Foreign key linking to CricketTeam(TeamID); ON DELETE SET NULL."]
        ],
        [1600, 2000, 1400, 4000]
    ))

    # Table 3.4
    p.append(make_para("Table 3.4: CricketUmpire Table Schema", bold=True, space_before=140, space_after=60))
    p.append(make_table(
        ["Field", "Type", "Key", "Description"],
        [
            ["UmpireID", "INT", "PRI", "Unique umpire identifier; auto-incremented primary key."],
            ["UmpireName", "VARCHAR(100)", "", "Full name of certified match referee."],
            ["Country", "VARCHAR(50)", "", "Country of officiating board accreditation."],
            ["Experience", "INT", "", "Years of certified professional umpiring experience."]
        ],
        [1600, 2000, 1400, 4000]
    ))

    # Table 3.5
    p.append(make_para("Table 3.5: TournamentMatch Table Schema", bold=True, space_before=140, space_after=60))
    p.append(make_table(
        ["Field", "Type", "Key", "Description"],
        [
            ["MatchID", "INT", "PRI", "Unique fixture identifier; auto-incremented primary key."],
            ["MatchDate", "DATE", "", "Scheduled calendar date of match fixture."],
            ["MatchType", "VARCHAR(50)", "", "Match format: T20, ODI, or Test."],
            ["StadiumID", "INT", "FK", "Foreign key references CricketStadium(StadiumID); ON DELETE SET NULL."],
            ["Result", "VARCHAR(100)", "", "Official outcome or current status of fixture."]
        ],
        [1600, 2000, 1400, 4000]
    ))

    # Table 3.6
    p.append(make_para("Table 3.6: TeamSponsor Table Schema", bold=True, space_before=140, space_after=60))
    p.append(make_table(
        ["Field", "Type", "Key", "Description"],
        [
            ["SponsorID", "INT", "PRI", "Unique sponsorship deal identifier; primary key."],
            ["SponsorName", "VARCHAR(100)", "", "Corporate brand or company sponsor name."],
            ["Industry", "VARCHAR(50)", "", "Commercial market sector (e.g., Conglomerate, Tech)."],
            ["ContractAmount", "DECIMAL(18,2)", "", "High-precision monetary contract valuation."],
            ["TeamID", "INT", "FK", "Foreign key references CricketTeam(TeamID); ON DELETE CASCADE."]
        ],
        [1600, 2000, 1400, 4000]
    ))

    # Table 3.7
    p.append(make_para("Table 3.7: MatchScorecard Table Schema", bold=True, space_before=140, space_after=60))
    p.append(make_table(
        ["Field", "Type", "Key", "Description"],
        [
            ["ScorecardID", "INT", "PRI", "Unique player-performance log identifier; primary key."],
            ["MatchID", "INT", "FK", "Foreign key references TournamentMatch(MatchID); ON DELETE CASCADE."],
            ["PlayerID", "INT", "FK", "Foreign key references CricketPlayer(PlayerID); ON DELETE CASCADE."],
            ["Runs", "INT", "", "Batting runs scored by player in this match fixture."],
            ["BallsFaced", "INT", "", "Total deliveries faced at the batting crease."],
            ["Wickets", "INT", "", "Bowled wickets claimed during the innings."],
            ["Overs", "DECIMAL(4,1)", "", "Total bowling overs delivered (e.g., 4.0)."]
        ],
        [1600, 2000, 1400, 4000]
    ))

    # Table 3.8
    p.append(make_para("Table 3.8: TeamParticipation Table Schema", bold=True, space_before=140, space_after=60))
    p.append(make_table(
        ["Field", "Type", "Key", "Description"],
        [
            ["TeamID", "INT", "PRI, FK", "Composite PK part 1; references CricketTeam(TeamID)."],
            ["MatchID", "INT", "PRI, FK", "Composite PK part 2; references TournamentMatch(MatchID)."]
        ],
        [1600, 2000, 1400, 4000]
    ))

    # Table 3.9
    p.append(make_para("Table 3.9: MatchOfficials Table Schema", bold=True, space_before=140, space_after=60))
    p.append(make_table(
        ["Field", "Type", "Key", "Description"],
        [
            ["MatchID", "INT", "PRI, FK", "Composite PK part 1; references TournamentMatch(MatchID)."],
            ["UmpireID", "INT", "PRI, FK", "Composite PK part 2; references CricketUmpire(UmpireID)."]
        ],
        [1600, 2000, 1400, 4000]
    ))

    p.append(make_heading2("3.4 Database Normalization"))
    p.append(make_body_p("Database normalization is the formal mathematical technique of organizing relations to minimize redundancy and eliminate insert, update, and delete anomalies. The schema CricketTournamentDB satisfies Boyce-Codd Normal Form (BCNF):"))
    
    p.append(make_heading3("1. First Normal Form (1NF)"))
    p.append(make_body_p("Requirement: All domain attributes must hold strictly atomic scalar values without repeating groups or nested arrays."))
    p.append(make_body_p("Verification: In all nine tables, every attribute holds scalar data. Multi-valued elements (such as multiple players on a team or multiple umpires per match) are modeled as distinct atomic rows across associative junction tables (TeamParticipation, MatchOfficials). Hence, 1NF is strictly met."))
    
    p.append(make_heading3("2. Second Normal Form (2NF)"))
    p.append(make_body_p("Requirement: The relation must be in 1NF and every non-prime attribute must be fully functionally dependent on the entire candidate key (no partial key dependencies)."))
    p.append(make_body_p("Verification: In the single-key tables (CricketTeam, CricketStadium, CricketPlayer, CricketUmpire, TournamentMatch, TeamSponsor, MatchScorecard), the primary key is atomic, making partial dependency impossible. In the composite junction tables (TeamParticipation, MatchOfficials), all attributes form the composite key with zero non-prime attributes. Hence, 2NF is strictly met."))
    
    p.append(make_heading3("3. Third Normal Form (3NF)"))
    p.append(make_body_p("Requirement: The relation must be in 2NF and no non-prime attribute can be transitively dependent on the primary key (no X -> Y -> Z dependencies)."))
    p.append(make_body_p("Verification: In CricketPlayer, team attributes (Coach, HomeGround) are not duplicated; only TeamID is stored. In TournamentMatch, stadium details (City, Capacity) are omitted and referenced solely through StadiumID. Non-prime attributes depend solely and directly on their relation's primary key. Hence, 3NF is strictly met."))
    
    p.append(make_heading3("4. Boyce-Codd Normal Form (BCNF)"))
    p.append(make_body_p("Requirement: For every non-trivial functional dependency X -> Y, X must be a superkey."))
    p.append(make_body_p("Verification: Across all tables, all determinants are candidate keys or primary keys. There are no overlapping candidate keys or anomalies where a non-prime attribute determines part of a key. Thus, BCNF is fully satisfied."))

    p.append(make_heading2("3.5 Limitations of Normalization"))
    p.append(make_body_p("While high normalization guarantees data consistency, it involves practical trade-offs:"))
    p.append(make_body_p("• Multi-Table JOIN Overhead: Reconstructing complete match scorecards requires joining five tables (MatchScorecard, CricketPlayer, CricketTeam, TournamentMatch, CricketStadium), which incurs query execution time at scale.", indent=360))
    p.append(make_body_p("• Aggregation Complexity: Calculating tournament-wide leaderboards (top run-scorers, team run totals) demands real-time GROUP BY computations across normalized tables.", indent=360))

    p.append(make_page_break())

    # -------------------------------------------------------------
    # CHAPTER 4: IMPLEMENTATION AND SCREENSHOTS
    # -------------------------------------------------------------
    p.append(make_heading1("Chapter 4: Implementation and Screenshots"))
    p.append(make_heading2("4.1 Overview"))
    p.append(make_body_p("CricketBuddy is built on a decoupled 3-tier client-server architecture: a MySQL 9.7 relational database tier, an asynchronous Node.js / Express.js REST API tier, and a responsive HTML5, CSS3, ES6 JavaScript presentation tier with offline Lucide icons."))

    p.append(make_heading2("4.2 Database Implementation"))
    p.append(make_body_p("The database was created under catalog CricketTournamentDB. Verification via the interactive MySQL CLI confirmed that all nine tables and schema attributes were created successfully:"))
    
    # Fig 4.1 & 4.2
    p.append(make_image_xml("rId9", 5486400, 3321620, "MySQL Tables", "Figure 4.1", "MySQL Terminal Verification — SHOW TABLES in CricketTournamentDB"))
    p.append(make_image_xml("rId10", 5486400, 3868340, "MySQL Describe", "Figure 4.2", "MySQL Schema Structure — DESCRIBE CricketTeam and CricketPlayer"))

    p.append(make_heading2("4.3 Tournament Overview Dashboard"))
    p.append(make_body_p("The executive dashboard provides a consolidated operational overview of the tournament. It queries /api/statistics and /api/teams to render real-time KPI counter cards for Participating Teams, Registered Players, Tournament Matches, Host Venues, Active Sponsors, and Certified Umpires."))
    p.append(make_image_xml("rId11", 5486400, 3118246, "Dashboard", "Figure 4.3", "CricketBuddy Tournament Executive Dashboard & KPI Metrics"))

    p.append(make_heading2("4.4 Team Management and Franchises"))
    p.append(make_body_p("The Team Management module enables inspection of participating franchises, assigned coaches, home grounds, and ownership details. Administrators can register new teams via an interactive modal executing parameterized SQL INSERT queries."))
    p.append(make_image_xml("rId12", 5486400, 3080742, "Teams Roster", "Figure 4.4", "Team Management Roster & Franchise Profiles"))

    p.append(make_heading2("4.5 Player Squad Roster and Athlete Profiles"))
    p.append(make_body_p("The Players module maintains roster information across all participating teams, featuring player name, age, playing role, nationality, jersey number, and franchise badge, supported by real-time role and team dropdown filters."))
    p.append(make_image_xml("rId13", 5486400, 3107531, "Players Roster", "Figure 4.5", "Player Squad Roster with Role Badges & Team Affiliations"))

    p.append(make_heading2("4.6 Tournament Matches and Fixture Scheduling"))
    p.append(make_body_p("The Matches module facilitates scheduling and tracking of tournament fixtures. It maps match dates, formats (ODI, T20), assigned stadiums, and match outcomes (Scheduled, Completed). Foreign key constraints ensure matches can only be scheduled at valid registered venues."))
    p.append(make_image_xml("rId14", 5486400, 3064668, "Tournament Matches", "Figure 4.6", "Tournament Matches & Fixture Scheduling Module"))

    p.append(make_heading2("4.7 Match Scorecards and Performance Logs"))
    p.append(make_body_p("The Match Scorecards module records individual batting runs, balls faced, automated strike rate calculations, bowling wickets, and overs bowled per player per fixture. Individual records link to players and fixtures through foreign keys with ON DELETE CASCADE."))
    p.append(make_image_xml("rId15", 5486400, 3118246, "Match Scorecards", "Figure 4.7", "Match Scorecards & Batting/Bowling Performance Tracking"))

    p.append(make_heading2("4.8 Stadiums and Host Venues"))
    p.append(make_body_p("The Stadiums view manages tournament host venues, storing stadium names, geographic host cities, and spectator seating capacities (e.g., Wankhede Stadium - 25,000 seats; Arun Jaitley Stadium - 30,000 seats)."))
    p.append(make_image_xml("rId16", 5486400, 3091457, "Stadiums View", "Figure 4.8", "Stadiums and Host Venues Management Interface"))

    p.append(make_heading2("4.9 Tournament Analytics and Aggregated Queries"))
    p.append(make_body_p("The Statistics module executes complex analytical SQL queries with JOINs, SUM(), COUNT(), and GROUP BY, calculating tournament-wide Top Run Scorers (e.g., Rohit Sharma - 100 Runs, Raunak Kwatra - 10 Runs), squad sizes per franchise, and cumulative sponsorship valuations."))
    p.append(make_image_xml("rId17", 5486400, 3086100, "Tournament Analytics", "Figure 4.9", "Tournament Analytics & Queries (Top Run Scorers, Squad Sizes, Sponsorships)"))

    p.append(make_heading2("4.10 Commercial Team Sponsorships"))
    p.append(make_body_p("The Sponsors view records commercial brand partnerships, industry classifications, and contract valuations (e.g., Tata Steel partnership at $25,000,000,000.00). High-precision DECIMAL(18,2) types prevent rounding discrepancies."))
    p.append(make_image_xml("rId26", 5486400, 3123604, "Sponsorships", "Figure 4.10", "Commercial Team Sponsorships & Contract Valuations View"))

    p.append(make_heading2("4.11 Certified Match Umpires and Referees"))
    p.append(make_body_p("The Umpires module maintains certified referees, years of professional experience, and country of origin (e.g., Nitin Menon, 12 Years experience, India), ensuring accredited officiating across all matches."))
    p.append(make_image_xml("rId27", 5486400, 3059310, "Umpires", "Figure 4.11", "Certified Match Referees and Umpires Directory"))

    p.append(make_heading2("4.12 Dual-Mode Authentication and Role-Based Access Control"))
    p.append(make_body_p("Modeled after SheetForge, CricketBuddy implements a dual-mode authentication modal. The Admin Login tab requires entering the master password ('admin123') to unlock full create, edit, and delete permissions. The Viewer Access tab requires no password; the user enters their full name and optional affiliation to immediately explore all tournament tables in a secure read-only mode."))
    p.append(make_image_xml("rId28", 5486400, 3086100, "Authentication Modal", "Figure 4.12", "SheetForge-Style Dual-Mode Authentication Modal (Admin vs Viewer)"))

    p.append(make_heading2("4.13 Live Global Search and Dropdown Filtering"))
    p.append(make_body_p("The top navigation bar incorporates an asynchronous global search engine that instantly indexes teams, players, venues, and coaches. As the user types into the search box, a synchronized dropdown reveals matching records categorized by entity with direct links."))
    p.append(make_image_xml("rId29", 5486400, 3091457, "Global Search Dropdown", "Figure 4.13", "Live Global Search & Real-Time Dropdown Filtering"))

    p.append(make_page_break())

    # -------------------------------------------------------------
    # CHAPTER 5: RESULTS AND DISCUSSION
    # -------------------------------------------------------------
    p.append(make_heading1("Chapter 5: Results and Discussion"))
    p.append(make_heading2("5.1 Presentation of Results"))
    p.append(make_body_p("The Cricket Tournament Management System was successfully engineered, normalized, and deployed locally. The system establishes a resilient database backend in MySQL with nine interconnected tables, supported by an Express.js REST API and a responsive web application."))
    p.append(make_body_p("All core CRUD operations across teams, venues, players, fixtures, scorecards, umpires, and sponsorships were verified. Live search filtering and dual-mode RBAC authentication operate with sub-50ms client responsiveness."))

    p.append(make_heading2("5.2 Discussion of Findings"))
    p.append(make_body_p("The project underscores several essential database engineering insights:"))
    p.append(make_body_p("1. Integrity via Constraints: Enforcing ON DELETE CASCADE on associative junction tables (TeamParticipation, MatchOfficials) and performance scorecards guarantees that deleting a match cleanly purges dependent records without leaving orphaned rows.", indent=360))
    p.append(make_body_p("2. Safe Nullification: Applying ON DELETE SET NULL on player-team and match-stadium relationships ensures that if a venue or team is temporarily decommissioned, player career records and historical match outcomes remain preserved.", indent=360))
    p.append(make_body_p("3. High-Precision Numerics: Utilizing DECIMAL(18,2) for sponsorship valuations and DECIMAL(4,1) for cricket overs is essential to avoid floating-point rounding errors inherent to standard DOUBLE or FLOAT datatypes.", indent=360))
    p.append(make_body_p("4. Client-Server Separation: Routing all SQL operations through an Express API using parameterized queries (? placeholders) completely insulates the database from SQL injection vulnerabilities.", indent=360))

    p.append(make_heading2("5.3 Testing and Validation"))
    p.append(make_body_p("System functionality was verified through comprehensive testing protocols:"))
    p.append(make_body_p("• Schema Verification Test: Executed SHOW TABLES and DESCRIBE commands in MySQL to verify all column types, auto-increment sequences, and foreign key constraints.", indent=360))
    p.append(make_body_p("• API Endpoint Test: Validated GET, POST, PUT, and DELETE operations across all REST routes (/api/teams, /api/players, /api/stadiums, /api/matches, /api/scorecards, /api/sponsors, /api/umpires).", indent=360))
    p.append(make_body_p("• Referential Integrity Test: Attempted inserting a player with an invalid TeamID; MySQL correctly rejected the transaction with an ER_NO_REFERENCED_ROW_2 foreign key violation.", indent=360))
    p.append(make_body_p("• Dual-Mode RBAC Test: Verified that entering an incorrect admin password rejects elevation with an error toast, while submitting Viewer info properly unlocks read-only access.", indent=360))
    p.append(make_body_p("• Live Search Test: Tested real-time search box filtering across teams, players, and venues, confirming instantaneous DOM table row updates.", indent=360))

    p.append(make_page_break())

    # -------------------------------------------------------------
    # CHAPTER 6: CONCLUSION
    # -------------------------------------------------------------
    p.append(make_heading1("Chapter 6: Conclusion"))
    p.append(make_heading2("6.1 Summary of Project Work"))
    p.append(make_body_p("The Cricket Tournament Management System (CricketBuddy) successfully demonstrates the practical implementation of relational database management systems integrated with modern web technologies. The project encompassed complete entity-relationship modeling, formal schema normalization to BCNF, creation of nine related MySQL tables, backend REST API development in Express.js / Node.js, and construction of an interactive, responsive user interface."))

    p.append(make_heading2("6.2 Achievement of Project Objectives"))
    p.append(make_body_p("All primary objectives established at the project inception were fully accomplished. A robust 9-table schema was implemented in MySQL under CricketTournamentDB without data redundancy. The backend exposes parameterized CRUD operations, and the frontend provides role-based administration, search filtering, and comprehensive tournament exploration."))

    p.append(make_heading2("6.3 Lessons Learned"))
    p.append(make_body_p("This project provided invaluable practical experience in:"))
    p.append(make_body_p("• The vital importance of rigorous ER modeling and cardinality planning prior to executing physical DDL statements.", indent=360))
    p.append(make_body_p("• Designing composite keys and associative junction tables to resolve many-to-many relationships cleanly.", indent=360))
    p.append(make_body_p("• Managing asynchronous database connection pooling in Node.js to prevent connection starvation.", indent=360))
    p.append(make_body_p("• Designing professional, accessible user interfaces with dual-mode authentication that cater to both administrative and public viewer needs.", indent=360))

    p.append(make_page_break())

    # -------------------------------------------------------------
    # CHAPTER 7: FUTURE WORK
    # -------------------------------------------------------------
    p.append(make_heading1("Chapter 7: Future Work"))
    p.append(make_heading2("7.1 Suggestions for Future Enhancements"))
    p.append(make_body_p("The current CricketBuddy implementation provides a robust foundation that can be expanded with several advanced features:"))
    p.append(make_body_p("1. WebSocket Live Commentary: Implementing bi-directional Socket.io communication to broadcast ball-by-ball commentary and real-time score updates to thousands of connected clients.", indent=360))
    p.append(make_body_p("2. Player Auction Simulator: Creating an interactive bidding module allowing franchises to participate in live player auctions with budget cap enforcement.", indent=360))
    p.append(make_body_p("3. Online Ticketing & Payment Gateway: Integrating real payment gateways (such as Razorpay or Stripe) to enable spectators to reserve and purchase stadium match tickets.", indent=360))
    p.append(make_body_p("4. Automated PDF Report Generation: Incorporating automated server-side PDF generation for tournament match summaries, official scorebooks, and tournament standings.", indent=360))

    p.append(make_heading2("7.2 Areas for Further Research"))
    p.append(make_body_p("Future research could investigate database sharding and read-replica distribution strategies to handle massive spikes during tournament finals. Additionally, machine learning algorithms could be trained on historical MatchScorecard records to generate predictive match-outcome models, Duckworth-Lewis-Stern (DLS) calculations, and automated athletic injury risk assessments."))

    p.append(make_page_break())

    # -------------------------------------------------------------
    # REFERENCES
    # -------------------------------------------------------------
    p.append(make_heading1("References"))
    refs = [
        "[1] Oracle Corporation. (2026). MySQL 9.7 Reference Manual. Available at: https://dev.mysql.com/doc/refman/9.7/en/",
        "[2] Silberschatz, A., Korth, H. F., & Sudarshan, S. (2020). Database System Concepts (7th ed.). McGraw-Hill Education.",
        "[3] Elmasri, R., & Navathe, S. B. (2017). Fundamentals of Database Systems (7th ed.). Pearson.",
        "[4] OpenJS Foundation. (2026). Node.js v20 Long-Term Support Documentation. Available at: https://nodejs.org/docs/",
        "[5] Express.js Foundation. (2026). Express Web Framework Documentation. Available at: https://expressjs.com/",
        "[6] MDN Web Docs. (2026). HTTP Request Methods and REST API Architecture. Available at: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods",
        "[7] W3C. (2026). HTML5 and CSS3 Specifications. Available at: https://www.w3.org/TR/html5/",
        "[8] International Cricket Council (ICC). (2026). Standard Playing Conditions and Tournament Regulations. Available at: https://www.icc-cricket.com/"
    ]
    for r in refs:
        p.append(make_para(r, font_size=20, space_after=80, justify=True, color="334155"))
        
    full_body = "".join(p)
    
    # Wrap in Word document body
    doc_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:cx="http://schemas.microsoft.com/office/drawing/2014/chartex" xmlns:cx1="http://schemas.microsoft.com/office/drawing/2015/9/8/chartex" xmlns:cx2="http://schemas.microsoft.com/office/drawing/2015/10/21/chartex" xmlns:cx3="http://schemas.microsoft.com/office/drawing/2016/5/9/chartex" xmlns:cx4="http://schemas.microsoft.com/office/drawing/2016/5/10/chartex" xmlns:cx5="http://schemas.microsoft.com/office/drawing/2016/5/11/chartex" xmlns:cx6="http://schemas.microsoft.com/office/drawing/2016/5/12/chartex" xmlns:cx7="http://schemas.microsoft.com/office/drawing/2016/5/13/chartex" xmlns:cx8="http://schemas.microsoft.com/office/drawing/2016/5/14/chartex" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:aink="http://schemas.microsoft.com/office/drawing/2016/ink" xmlns:am3d="http://schemas.microsoft.com/office/drawing/2017/model3d" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:oel="http://schemas.microsoft.com/office/2019/extlst" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml" xmlns:w16cex="http://schemas.microsoft.com/office/word/2018/wordml/cex" xmlns:w16cid="http://schemas.microsoft.com/office/word/2016/wordml/cid" xmlns:w16="http://schemas.microsoft.com/office/word/2018/wordml" xmlns:w16du="http://schemas.microsoft.com/office/word/2023/wordml/word16du" xmlns:w16sdtdh="http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash" xmlns:w16sdtfl="http://schemas.microsoft.com/office/word/2024/wordml/sdtformatlock" xmlns:w16se="http://schemas.microsoft.com/office/word/2015/wordml/symex" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 w15 w16se w16cid w16 w16cex w16sdtdh w16sdtfl w16du wp14">
  <w:body>
    {full_body}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
      <w:cols w:space="720"/>
      <w:docGrid w:linePitch="360"/>
    </w:sectPr>
  </w:body>
</w:document>"""
    return doc_xml

def save_image_as_jpeg(src_path, quality=95):
    im = Image.open(src_path).convert('RGB')
    bio = io.BytesIO()
    im.save(bio, 'JPEG', quality=quality)
    return bio.getvalue()

def create_report():
    print(f"Creating project report from template: {TEMPLATE_PATH}")
    new_doc_xml = build_full_document_xml()
    
    # Image Paths mapping
    p_er = '/Users/raunakkwatra/Desktop/CRICKETTOURNAMENT/er_diagram.png'
    p3 = '/Users/raunakkwatra/.gemini/antigravity/brain/32b7a23b-8425-4491-8b87-b291fd8f590e/.user_uploaded/media_1792653334970_293de24e.png'
    p4 = '/Users/raunakkwatra/.gemini/antigravity/brain/32b7a23b-8425-4491-8b87-b291fd8f590e/.user_uploaded/media_1792653334984_5fd971f9.png'
    p5 = '/Users/raunakkwatra/.gemini/antigravity/brain/32b7a23b-8425-4491-8b87-b291fd8f590e/.user_uploaded/media_1792653334986_0c452af8.png'
    p6 = '/Users/raunakkwatra/.gemini/antigravity/brain/32b7a23b-8425-4491-8b87-b291fd8f590e/.user_uploaded/media_1792653334994_d969d935.png'
    p7 = '/Users/raunakkwatra/.gemini/antigravity/brain/32b7a23b-8425-4491-8b87-b291fd8f590e/.user_uploaded/media_1792653334991_7b3f6279.png'
    p8 = '/Users/raunakkwatra/.gemini/antigravity/brain/32b7a23b-8425-4491-8b87-b291fd8f590e/.user_uploaded/media_1792940075463_e318f05e.png'  # Fig 4.6 Matches
    p9 = '/Users/raunakkwatra/.gemini/antigravity/brain/32b7a23b-8425-4491-8b87-b291fd8f590e/.user_uploaded/media_1792940075464_4782eb11.png'  # Fig 4.7 Scorecards
    p10 = '/Users/raunakkwatra/.gemini/antigravity/brain/32b7a23b-8425-4491-8b87-b291fd8f590e/.user_uploaded/media_1792940075460_f79a4aca.png' # Fig 4.8 Stadiums
    p11 = '/Users/raunakkwatra/.gemini/antigravity/brain/32b7a23b-8425-4491-8b87-b291fd8f590e/.user_uploaded/media_1792940075494_04bfae19.png' # Fig 4.9 Statistics
    p12 = '/Users/raunakkwatra/.gemini/antigravity/brain/32b7a23b-8425-4491-8b87-b291fd8f590e/.user_uploaded/media_1792653357369_c734bd30.png' # Fig 4.10 Sponsors
    p13 = '/Users/raunakkwatra/.gemini/antigravity/brain/32b7a23b-8425-4491-8b87-b291fd8f590e/.user_uploaded/media_1792653357368_6a965fcc.png' # Fig 4.11 Umpires
    p14 = '/Users/raunakkwatra/.gemini/antigravity/brain/32b7a23b-8425-4491-8b87-b291fd8f590e/.user_uploaded/media_1792653357374_f7f5504e.png' # Fig 4.12 Auth Modal
    p15 = '/Users/raunakkwatra/.gemini/antigravity/brain/32b7a23b-8425-4491-8b87-b291fd8f590e/.user_uploaded/media_1792653357372_33c3d805.png' # Fig 4.13 Search

    core_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>Cricket Tournament Management System (CricketBuddy) - Project Report</dc:title><dc:subject>RDBMS CS2102 Project Report</dc:subject><dc:creator>Raunak Kwatra &amp; Kartikey Aggarwal</dc:creator><cp:keywords>CricketBuddy, RDBMS, MySQL, BCNF, Node.js, Express, Manipal University Jaipur</cp:keywords><dc:description>Academic Project Report for Relational Database Management Systems Laboratory (CS2102), Department of Computer Science and Engineering, Manipal University Jaipur.</dc:description><cp:lastModifiedBy>Raunak Kwatra</cp:lastModifiedBy><cp:revision>3</cp:revision><dcterms:created xsi:type="dcterms:W3CDTF">2026-10-26T05:45:00Z</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">2026-10-26T05:45:00Z</dcterms:modified></cp:coreProperties>"""

    with zipfile.ZipFile(TEMPLATE_PATH, 'r') as zin, zipfile.ZipFile(OUTPUT_PATH, 'w', compression=zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            if item.filename == 'word/document.xml':
                zout.writestr(item, new_doc_xml.encode('utf-8'))
            elif item.filename == 'docProps/core.xml':
                zout.writestr(item, core_xml.encode('utf-8'))
            elif item.filename == 'docProps/app.xml':
                app_xml = zin.read(item.filename).decode('utf-8')
                app_xml = app_xml.replace('<Company>HP</Company>', '<Company>Manipal University Jaipur</Company>')
                zout.writestr(item, app_xml.encode('utf-8'))
            elif item.filename == 'word/_rels/document.xml.rels':
                orig_rels = zin.read(item.filename).decode('utf-8')
                new_rels = []
                if 'rId26' not in orig_rels:
                    new_rels.append('<Relationship Id="rId26" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image12.jpeg"/>')
                if 'rId27' not in orig_rels:
                    new_rels.append('<Relationship Id="rId27" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image13.jpeg"/>')
                if 'rId28' not in orig_rels:
                    new_rels.append('<Relationship Id="rId28" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image14.jpeg"/>')
                if 'rId29' not in orig_rels:
                    new_rels.append('<Relationship Id="rId29" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image15.jpeg"/>')
                if 'rId30' not in orig_rels:
                    new_rels.append('<Relationship Id="rId30" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="https://github.com/raunakkwatra/CricketBuddy" TargetMode="External"/>')
                if new_rels:
                    orig_rels = orig_rels.replace('</Relationships>', "".join(new_rels) + '</Relationships>')
                zout.writestr(item, orig_rels.encode('utf-8'))
            elif item.filename == 'word/media/image2.png' and os.path.exists(p_er):
                with open(p_er, 'rb') as f_img:
                    zout.writestr(item, f_img.read())
            elif item.filename == 'word/media/image3.png' and os.path.exists(p3):
                with open(p3, 'rb') as f:
                    zout.writestr(item, f.read())
            elif item.filename == 'word/media/image4.png' and os.path.exists(p4):
                with open(p4, 'rb') as f:
                    zout.writestr(item, f.read())
            elif item.filename == 'word/media/image5.jpeg' and os.path.exists(p5):
                zout.writestr(item, save_image_as_jpeg(p5))
            elif item.filename == 'word/media/image6.jpeg' and os.path.exists(p6):
                zout.writestr(item, save_image_as_jpeg(p6))
            elif item.filename == 'word/media/image7.jpeg' and os.path.exists(p7):
                zout.writestr(item, save_image_as_jpeg(p7))
            elif item.filename == 'word/media/image8.jpeg' and os.path.exists(p8):
                zout.writestr(item, save_image_as_jpeg(p8))
            elif item.filename == 'word/media/image9.jpeg' and os.path.exists(p9):
                zout.writestr(item, save_image_as_jpeg(p9))
            elif item.filename == 'word/media/image10.jpeg' and os.path.exists(p10):
                zout.writestr(item, save_image_as_jpeg(p10))
            elif item.filename == 'word/media/image11.jpeg' and os.path.exists(p11):
                zout.writestr(item, save_image_as_jpeg(p11))
            else:
                zout.writestr(item, zin.read(item.filename))
        
        # Write additional media files
        if os.path.exists(p12):
            zout.writestr('word/media/image12.jpeg', save_image_as_jpeg(p12))
        if os.path.exists(p13):
            zout.writestr('word/media/image13.jpeg', save_image_as_jpeg(p13))
        if os.path.exists(p14):
            zout.writestr('word/media/image14.jpeg', save_image_as_jpeg(p14))
        if os.path.exists(p15):
            zout.writestr('word/media/image15.jpeg', save_image_as_jpeg(p15))
                
    print(f"Report successfully generated at: {OUTPUT_PATH}")
    print(f"File size: {os.path.getsize(OUTPUT_PATH)} bytes")

if __name__ == '__main__':
    create_report()
