import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import RNFS from 'react-native-fs';
import { PermissionsAndroid, Platform, Alert } from 'react-native';

const requestStoragePermission1 = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};
const requestStoragePermission = async () => {
  try {
   

     const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
              {
                title: 'Microphone Permission',
                message: 'App needs access to your microphone for the interview.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              },
            );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can use the camera');
    } else {
      console.log('Camera permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
};
const downloadPdf = async (reportData, candidate, overallScore) => {
  const hasPermission = await requestStoragePermission();
  if (!hasPermission) {
    Alert.alert(
      'Permission Denied',
      'Cannot save PDF without storage permission.',
    );
    return;
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { height } = page.getSize();
  let y = height - 40;

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const drawText = (
    text,
    x,
    y,
    font = helveticaFont,
    size = 12,
    color = rgb(0, 0, 0),
  ) => {
    page.drawText(text, { x, y, size, font, color });
  };

  const drawSectionTitle = title => {
    y -= 25;
    drawText(title, 50, y, boldFont, 14);
  };

  const drawField = (label, value) => {
    y -= 18;
    drawText(label, 50, y, boldFont);
    drawText(value, 150, y, helveticaFont);
  };

  const drawMultilineText = text => {
    const lines = text.split('\n');
    lines.forEach(line => {
      y -= 15;
      drawText(line, 50, y);
    });
  };

  drawText(
    'Interview Report By AI Interview Agents',
    150,
    y,
    boldFont,
    18,
    rgb(0, 0.4, 0.8),
  );
  y -= 30;

  drawSectionTitle('Candidate Information');
  drawField(
    'Name:',
    `${candidate?.firstName || ''} ${candidate?.lastName || ''}`,
  );
  drawField('Email:', candidate?.email || 'N/A');
  drawField('Role:', reportData?.position || 'N/A');
  drawField('Date:', reportData?.interviewDate || 'N/A');
  drawField('Time:', reportData?.interviewTime || 'N/A');
  drawField('Interviewer:', reportData?.interviewers?.[0] || 'N/A');
  drawField('Overall Score:', `${overallScore} %`);

  drawSectionTitle('Summary');
  drawMultilineText(reportData?.feedback?.report?.analysis_summary || 'N/A');

  drawSectionTitle('Strengths');
  drawMultilineText(
    reportData?.feedback?.report?.strengths
      ?.map((s, i) => `${i + 1}. ${s}`)
      .join('\n') || 'N/A',
  );

  drawSectionTitle('Areas for Improvement');
  drawMultilineText(
    reportData?.feedback?.report?.weaknesses
      ?.map((w, i) => `${i + 1}. ${w}`)
      .join('\n') || 'N/A',
  );

  const pdfBytes = await pdfDoc.save();

  const filePath = `${RNFS.DownloadDirectoryPath}/interview-report.pdf`;
  await RNFS.DownloadDirectoryPath(filePath, pdfBytes, 'base64');
  Alert.alert('PDF Saved', `Saved to Downloads: interview-report.pdf`);
};
export default downloadPdf;
