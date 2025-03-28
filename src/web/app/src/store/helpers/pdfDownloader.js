import JavascriptPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  DESCRIPTION_MARGIN_TOP,
  PDF_CHART_MARGIN_LEFT,
  PDF_CHART_MARGIN_TOP,
  PDF_CHART_WIDTH,
  TITLE_FONT_SIZE,
  TITLE_AND_DATE_MARGIN_LEFT,
  TITLE_MARGIN_TOP,
  DATE_FONT_SIZE,
  DATE_MARGIN_TOP,
  DOWNLOAD_DATE_LABEL,
} from '@/common/const';

let doc, marginTop;

export function downloadAsPresentation(presentationFormName) {
  doc = new JavascriptPDF('l', 'mm', 'a4');
  marginTop = PDF_CHART_MARGIN_TOP;
  doc.setFontSize(TITLE_FONT_SIZE);
  doc.text(TITLE_AND_DATE_MARGIN_LEFT, TITLE_MARGIN_TOP, presentationFormName);
  doc.setFontSize(DATE_FONT_SIZE);
  doc.text(TITLE_AND_DATE_MARGIN_LEFT, DATE_MARGIN_TOP, DOWNLOAD_DATE_LABEL + (new Date()).toString());

  return createPresentablePDF(presentationFormName);
}

export function download(presentationFormName) {
  doc = new JavascriptPDF('p', 'mm', 'a4');
  marginTop = PDF_CHART_MARGIN_TOP;
  doc.setFontSize(TITLE_FONT_SIZE);
  doc.text(TITLE_AND_DATE_MARGIN_LEFT, TITLE_MARGIN_TOP, presentationFormName);
  doc.setFontSize(DATE_FONT_SIZE);
  doc.text(TITLE_AND_DATE_MARGIN_LEFT, DATE_MARGIN_TOP, DOWNLOAD_DATE_LABEL + (new Date()).toString());

  return createPDF(presentationFormName);
}

function getDescription() {
  return html2canvas(document.getElementById('presentation-description')).then(element => {
    const imageData = element.toDataURL('image/png');
    if (imageData === 'data:,') {
      // according to documentation of toDataURL, if the canvas is of 0 width, 0 height,
      // the function will return string "data:,". If the canvas is empty, directly return
      return;
    }
    const descriptionHeight = element.height * PDF_CHART_WIDTH / element.width;
    doc.addImage(imageData, 'PNG', PDF_CHART_MARGIN_LEFT, DESCRIPTION_MARGIN_TOP, PDF_CHART_WIDTH, descriptionHeight, '', 'FAST');
  });
}

function getChart(chartElement, idx) {
  return html2canvas(chartElement).then(element => {
    if (idx > 0 && idx % 2 === 0) {
      doc.addPage();
      marginTop = PDF_CHART_MARGIN_TOP;
    }
    const imageData = element.toDataURL('image/png');
    const chartHeight = element.height * PDF_CHART_WIDTH / element.width;
    doc.addImage(imageData, 'PNG', PDF_CHART_MARGIN_LEFT, marginTop, PDF_CHART_WIDTH, chartHeight, '', 'FAST');
    marginTop = chartHeight + marginTop * 2;
  });
}

const getSingleChartInPage = async (chartElement) => {
  return html2canvas(chartElement).then(element => {
    doc.addPage();
    const imageData = element.toDataURL('image/png');
    const chartWidth = doc.internal.pageSize.getWidth();
    const chartHeight = doc.internal.pageSize.getHeight();
    doc.addImage(imageData, 'PNG', 0, 0, chartWidth, chartHeight, '', 'FAST');
  });
};

async function createPDF(pdfName) {
  await getDescription();
  const chartElements = document.getElementsByClassName('presentation-section');
  for (let i = 0; i < chartElements.length; i++) {
    await getChart(chartElements[i], i);
  }
  doc.save(`${pdfName  }.pdf`);
}

const createPresentablePDF = async (presentationName) => {
  await getDescription();
  const chartElements = document.getElementsByClassName('presentation-section');
  for (let i = 0; i < chartElements.length; i++) {
    await getSingleChartInPage(chartElements[i]);
  }
  doc.save(`${presentationName  }.pdf`);
};
