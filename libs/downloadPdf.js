// downloadPdfFormattedSpaced.js
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import RNFS from 'react-native-fs';
import {
  PermissionsAndroid,
  Platform,
  Alert,
  NativeModules,
} from 'react-native';
import { Buffer } from 'buffer';

const { MediaStoreModule } = NativeModules;

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const TOP_MARGIN = 40;
const BOTTOM_MARGIN = 40;
const LEFT_MARGIN = 40;
const RIGHT_MARGIN = 40;
const LINE_HEIGHT = 15;

const requestLegacyStoragePermission = async () => {
  if (Platform.OS !== 'android') return true;
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permission',
        message: 'App needs access to save the interview PDF to Downloads',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('permission request error', err);
    return false;
  }
};

const saveToDownloads = async (base64, filename) => {
  if (Platform.OS === 'android' && Platform.Version >= 30 && MediaStoreModule) {
    return await MediaStoreModule.savePdfToDownloads(base64, filename);
  }
  if (Platform.OS === 'android') {
    const ok = await requestLegacyStoragePermission();
    if (!ok) return null;
    const path = `${RNFS.DownloadDirectoryPath}/${filename}`;
    await RNFS.writeFile(path, base64, 'base64');
    return path;
  }
  const iosPath = `${RNFS.DocumentDirectoryPath}/${filename}`;
  await RNFS.writeFile(iosPath, base64, 'base64');
  return iosPath;
};

const checkPageOverflow = (pdfDoc, page, y, neededHeight = LINE_HEIGHT) => {
  if (y - neededHeight < BOTTOM_MARGIN) {
    const newPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    return { page: newPage, y: PAGE_HEIGHT - TOP_MARGIN };
  }
  return { page, y };
};

const downloadPdf = async (
  reportData = {},
  candidate = {},
  overallScore = 0,
) => {
  try {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = PAGE_HEIGHT - TOP_MARGIN;

    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const drawText = (text, x, font, size, color = rgb(0, 0, 0)) => {
      page.drawText(String(text), { x, y, font, size, color });
    };

    const addSpace = (amount = LINE_HEIGHT) => {
      y -= amount;
    };

    const addSectionTitle = title => {
      ({ page, y } = checkPageOverflow(pdfDoc, page, y, LINE_HEIGHT));
      drawText(title, LEFT_MARGIN, helveticaBold, 14);
      addSpace(LINE_HEIGHT + 5);
    };

    const addField = (label, value) => {
      ({ page, y } = checkPageOverflow(pdfDoc, page, y, LINE_HEIGHT));
      page.drawText(label, {
        x: LEFT_MARGIN,
        y,
        font: helveticaBold,
        size: 12,
      });
      page.drawText(value, {
        x: LEFT_MARGIN + 100,
        y,
        font: helvetica,
        size: 12,
      });
      addSpace(LINE_HEIGHT);
    };

    const addMultilineText = (content, font = helvetica, size = 11) => {
      if (!content) content = 'N/A';
      const maxWidth = PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN;
      const words = content.split(/\s+/);
      let line = '';
      words.forEach(word => {
        const testLine = line ? `${line} ${word}` : word;
        const width = font.widthOfTextAtSize(testLine, size);
        if (width > maxWidth) {
          ({ page, y } = checkPageOverflow(pdfDoc, page, y, LINE_HEIGHT));
          page.drawText(line, { x: LEFT_MARGIN, y, font, size });
          addSpace(LINE_HEIGHT);
          line = word;
        } else {
          line = testLine;
        }
      });
      if (line) {
        ({ page, y } = checkPageOverflow(pdfDoc, page, y, LINE_HEIGHT));
        page.drawText(line, { x: LEFT_MARGIN, y, font, size });
        addSpace(LINE_HEIGHT);
      }
      addSpace(5);
    };

    const addList = items => {
      if (!items || items.length === 0) {
        addMultilineText('N/A');
        return;
      }
      items.forEach((item, idx) => {
        const line = `${idx + 1}. ${item}`;
        addMultilineText(line);
      });
      addSpace(5);
    };

    const addSkillSections = skills => {
      if (!skills || Object.keys(skills).length === 0) {
        addMultilineText('N/A');
        return;
      }
      Object.entries(skills).forEach(([skill, { score, description }]) => {
        const prettySkill = skill
          .replace(/_/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
        ({ page, y } = checkPageOverflow(pdfDoc, page, y, LINE_HEIGHT));
        page.drawText(prettySkill, {
          x: LEFT_MARGIN,
          y,
          font: helveticaBold,
          size: 13,
        });
        addSpace(LINE_HEIGHT);

        addMultilineText(`Description: ${description || 'N/A'}`);
        addMultilineText(`Score: ${score !== undefined ? score : 'N/A'}`);
        addSpace(10);
      });
    };

    // Header
    const title = 'Interview Report By AI Interview Agents';
    const titleWidth = helveticaBold.widthOfTextAtSize(title, 20);
    const x = (PAGE_WIDTH - titleWidth) / 2;
    page.drawText(title, {
      x,
      y,
      font: helveticaBold,
      size: 20,
      color: rgb(0, 0.4, 0.8),
    });
    addSpace(30);

    // Candidate info
    addSectionTitle('Candidate Information');
    addField(
      'Name:',
      `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() ||
        'N/A',
    );
    addField('Email:', candidate.email || 'N/A');
    addField('Role:', reportData.position || 'N/A');
    addField('Date:', reportData.interviewDate || 'N/A');
    addField('Time:', reportData.interviewTime || 'N/A');
    addField('Interviewer:', reportData.interviewers?.[0] || 'N/A');
    addField('Overall Score:', `${overallScore} %`);
    addSpace(15);

    // Summary
    addSectionTitle('Summary');
    addMultilineText(reportData?.feedback?.report?.analysis_summary);
    addSpace(10);

    // Strengths
    addSectionTitle('Strengths');
    addList(reportData?.feedback?.report?.strengths);
    addSpace(10);

    // Areas for Improvement
    addSectionTitle('Areas for Improvement');
    addList(reportData?.feedback?.report?.weaknesses);
    addSpace(15);

    // Skills
    addSectionTitle('Skills Assessment');
    addSkillSections(reportData?.feedback?.report?.technical_skills);

    // Save
    const pdfBytes = await pdfDoc.save();
    const base64 = Buffer.from(pdfBytes).toString('base64');
    const filename = 'interview-report.pdf';
    const path = await saveToDownloads(base64, filename);

    if (path) {
      Alert.alert(
        'PDF Saved',
        `Your interview report has been successfully saved to the ${
          Platform.OS === 'ios' ? 'Documents' : 'Downloads'
        } folder.`,
      );
    } else {
      Alert.alert(
        'Save failed',
        'The interview report could not be saved. Please try again.',
      );
    }
  } catch (err) {
    console.error('save pdf error', err);
    Alert.alert('Save failed', err.message || 'Failed to save PDF');
  }
};

export default downloadPdf;
