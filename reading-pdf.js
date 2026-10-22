/* Local PDF generation: no reading or journal content leaves the browser. */
(function(root){
  async function create(sections,year){
    const {PDFDocument,StandardFonts,rgb}=root.PDFLib;
    const pdf=await PDFDocument.create();
    pdf.setTitle('RESONATE · Tarot Reading');pdf.setAuthor('RESONATE');
    const regular=await pdf.embedFont(StandardFonts.Helvetica);
    const bold=await pdf.embedFont(StandardFonts.HelveticaBold);
    const gold=rgb(.65,.48,.18),ink=rgb(.13,.12,.15);
    let page,y;
    function newPage(){
      page=pdf.addPage([595.28,841.89]);y=748;
      page.drawText('RESONATE',{x:46,y:792,size:23,font:bold,color:gold});
      page.drawText('TAROT EXPLORER · YOUR PERSONAL READING',{x:46,y:774,size:9,font:regular,color:ink});
      page.drawLine({start:{x:46,y:763},end:{x:549,y:763},color:gold,thickness:1});
    }
    const safe=value=>String(value).normalize('NFKD').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–—]/g,'-').replace(/→/g,'').replace(/[^\x20-\x7e\xa0-\xff\n]/g,'');
    function write(text,font,size){
      const width=503;
      for(const paragraph of safe(text).split('\n')){
        let line='';
        for(const word of paragraph.split(/\s+/)){
          // Split very long unbroken journal words as well as ordinary prose.
          for(const part of word.match(/.{1,55}/g)||['']){
            if(font.widthOfTextAtSize((line?line+' ':'')+part,size)>width&&line){draw(line);line='';}
            line+=(line?' ':'')+part;
          }
        }
        draw(line);y-=5;
      }
      function draw(line){if(y<65)newPage();page.drawText(line,{x:46,y,size,font,color:ink});y-=size*1.45;}
    }
    newPage();
    for(const section of sections){if(y<120)newPage();write(section.title,bold,14);write(section.text,regular,10.5);y-=12;}
    const pages=pdf.getPages();
    pages.forEach((p,i)=>{
      p.drawLine({start:{x:46,y:48},end:{x:549,y:48},color:gold,thickness:.5});
      p.drawText(`© ${year} RESONATE. All rights reserved. For personal reflection.`,{x:46,y:33,size:8,font:regular,color:ink});
      p.drawText(`${i+1} / ${pages.length}`,{x:516,y:33,size:8,font:regular,color:ink});
    });
    return pdf.save();
  }
  root.ResonatePDF={create};
})(globalThis);
