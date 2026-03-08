import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface QuoteItem {
  product_name: string;
  product_type: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface QuoteData {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  items: QuoteItem[];
  total_value: number;
  status: string;
  notes: string | null;
  created_at: string;
}

export const generateQuotePDF = async (quote: QuoteData) => {
  const doc = new jsPDF();

  // Brand header
  doc.setFillColor(190, 24, 93);
  doc.rect(14, 12, 182, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("BEBEMAIS", 105, 24, { align: "center" });
  doc.setTextColor(0, 0, 0);
  
  // Quote title
  doc.setFontSize(14);
  doc.text("ORCAMENTO", 105, 42, { align: "center" });
  
  // Quote Info
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Numero: ${quote.id.substring(0, 8).toUpperCase()}`, 14, 57);
  doc.text(`Data: ${new Date(quote.created_at).toLocaleDateString("pt-BR")}`, 14, 63);
  
  // Status
  const statusMap: Record<string, string> = {
    pending: "Pendente",
    approved: "Aprovado",
    rejected: "Rejeitado",
  };
  doc.text(`Status: ${statusMap[quote.status] || quote.status}`, 14, 69);
  
  // Customer Info
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("DADOS DO CLIENTE", 14, 82);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Nome: ${quote.customer_name}`, 14, 90);
  if (quote.customer_email) {
    doc.text(`Email: ${quote.customer_email}`, 14, 96);
  }
  doc.text(`Telefone: ${quote.customer_phone}`, 14, 102);
  
  // Items Table
  const tableData = quote.items.map((item) => [
    item.product_name,
    item.product_type,
    item.quantity.toString(),
  ]);
  
  autoTable(doc, {
    startY: 112,
    head: [["Produto", "Tipo", "Quantidade"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
    },
    columnStyles: {
      2: { halign: "center" },
    },
  });
  
  // Contact Info
  const finalY = ((doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY) || 120;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(190, 24, 93);
  doc.text("PEDIDO RECEBIDO PELO TIME BEBEMAIS", 105, finalY + 10, { align: "center" });
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text("Nossa equipe entrara em contato para confirmar itens, valores e entrega.", 105, finalY + 18, { align: "center" });
  
  // Notes
  if (quote.notes) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("OBSERVAÇÕES:", 14, finalY + 30);
    
    doc.setFont("helvetica", "normal");
    const splitNotes = doc.splitTextToSize(quote.notes, 180);
    doc.text(splitNotes, 14, finalY + 37);
  }
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("Este documento resume a solicitacao e nao substitui comprovantes fiscais.", 105, pageHeight - 15, { align: "center" });
  
  // Save
  const fileName = `orcamento_${quote.customer_name.replace(/\s+/g, "_")}_${quote.id.substring(0, 8)}.pdf`;
  doc.save(fileName);
};
