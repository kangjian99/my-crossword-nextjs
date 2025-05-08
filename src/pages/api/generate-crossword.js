import { generateCrossword } from '../../utils/crosswordGenerator';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { words, gridSize, difficulty } = req.body;

    if (!words || !gridSize || !difficulty) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    try {
      const { grid, used } = generateCrossword(words, gridSize, difficulty);
      
      // 在后端记录生成的词汇列表
      console.log('Generated Crossword Used Words:', used);

      res.status(200).json({ grid, usedWords: used });
    } catch (error) {
      console.error('Error generating crossword:', error);
      res.status(500).json({ message: 'Error generating crossword' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
} 