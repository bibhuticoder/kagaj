/**
 * Compact Trie Data Structure for Lexicon Storage & Autocomplete
 */
export class TrieNode {
  children: Map<string, TrieNode>;
  isWord: boolean;
  devanagari: string | null;
  frequency: number; // Higher frequency = higher candidate rank

  constructor() {
    this.children = new Map();
    this.isWord = false;
    this.devanagari = null;
    this.frequency = 0;
  }
}

export class LexiconTrie {
  root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(roman: string, devanagari: string, frequency = 1): void {
    let node = this.root;
    const cleanRoman = roman.toLowerCase();
    for (const char of cleanRoman) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
    }
    node.isWord = true;
    node.devanagari = devanagari;
    node.frequency = frequency;
  }

  lookup(roman: string): { devanagari: string; frequency: number } | null {
    let node = this.root;
    const cleanRoman = roman.toLowerCase();
    for (const char of cleanRoman) {
      if (!node.children.has(char)) return null;
      node = node.children.get(char)!;
    }
    return node.isWord && node.devanagari
      ? { devanagari: node.devanagari, frequency: node.frequency }
      : null;
  }

  // Find prefix candidates for real-time suggestion dropdowns
  findPrefixMatches(prefix: string, limit = 5): string[] {
    let node = this.root;
    const cleanPrefix = prefix.toLowerCase();
    for (const char of cleanPrefix) {
      if (!node.children.has(char)) return [];
      node = node.children.get(char)!;
    }

    const results: { devanagari: string; freq: number }[] = [];
    const traverse = (currNode: TrieNode) => {
      if (currNode.isWord && currNode.devanagari) {
        results.push({ devanagari: currNode.devanagari, freq: currNode.frequency });
      }
      for (const nextNode of currNode.children.values()) {
        traverse(nextNode);
      }
    };
    traverse(node);

    return results
      .sort((a, b) => b.freq - a.freq)
      .slice(0, limit)
      .map((item) => item.devanagari);
  }
}

/**
 * Phonetic Rule Engine & Finite State Machine with Numerals & Diacritics
 */
export class RomanNepaliTransliterator {
  trie: LexiconTrie;
  numerals!: Record<string, string>;
  modifiers!: Record<string, string>;
  consonants!: Record<string, string>;
  matras!: Record<string, string>;
  independentVowels!: Record<string, string>;
  virama!: string;

  constructor(customLexicon: Record<string, string> = {}) {
    this.trie = new LexiconTrie();
    this.initMaps();
    this.loadDefaultLexicon();
    this.loadCustomLexicon(customLexicon);
  }

  initMaps(): void {
    // 1. Devanagari Numerals (0-9)
    this.numerals = {
      '0': '०',
      '1': '१',
      '2': '२',
      '3': '३',
      '4': '४',
      '5': '५',
      '6': '६',
      '7': '७',
      '8': '८',
      '9': '९',
    };

    // 2. Nasal & Diacritic Modifiers
    // ** or ~n = Chandrabindu (ँ)
    // * or M = Anusvara (ं)
    // : or H = Visarga (ः)
    // .d = Nukta (़)
    this.modifiers = {
      '**': '\u0901', // Chandrabindu (ँ)
      '~n': '\u0901', // Chandrabindu alternate
      '*': '\u0902', // Anusvara (ं)
      ':': '\u0903', // Visarga (ः)
      '.d': '\u093C', // Nukta (़)
    };

    // 3. Consonant Mappings (Longest to shortest to prevent greedy mismatches)
    this.consonants = {
      ksha: 'क्ष',
      chha: 'छ',
      shha: 'ष',
      gya: 'ज्ञ',
      tra: 'त्र',
      chh: 'छ',
      shh: 'ष',
      kh: 'ख',
      gh: 'घ',
      ch: 'च',
      jh: 'झ',
      th: 'थ',
      dh: 'ध',
      ph: 'फ',
      bh: 'भ',
      sh: 'श',
      ng: 'ङ',
      ny: 'ञ',
      gy: 'ज्ञ',
      tr: 'त्र',
      k: 'क',
      g: 'ग',
      j: 'ज',
      t: 'त',
      d: 'द',
      n: 'न',
      p: 'प',
      b: 'ब',
      m: 'म',
      y: 'य',
      r: 'र',
      l: 'ल',
      w: 'व',
      v: 'व',
      s: 'स',
      h: 'ह',
    };

    // 4. Dependent Matras (attach to consonants)
    this.matras = {
      aau: 'ाउ',
      aai: 'ाइ',
      aa: 'ा',
      ee: 'ी',
      oo: 'ू',
      ai: 'ै',
      au: 'ौ',
      a: '',
      i: 'ि',
      u: 'ु',
      e: 'े',
      o: 'ो',
      ri: 'ृ',
    };

    // 5. Independent Vowels (standalone or syllable start)
    this.independentVowels = {
      aau: 'आउ',
      aai: 'आइ',
      aa: 'आ',
      ee: 'ई',
      oo: 'ऊ',
      ai: 'ऐ',
      au: 'औ',
      a: 'अ',
      i: 'इ',
      u: 'उ',
      e: 'ए',
      o: 'ओ',
      ri: 'ऋ',
    };

    this.virama = '्';
  }

  loadDefaultLexicon(): void {
    const seed: [string, string, number][] = [
      ['namaste', 'नमस्ते', 100],
      ['nepal', 'नेपाल', 98],
      ['nepali', 'नेपाली', 97],
      ['mero', 'मेरो', 95],
      ['naam', 'नाम', 90],
      ['nam', 'नाम', 88],
      ['ramro', 'राम्रो', 92],
      ['raamro', 'राम्रो', 85],
      ['ghar', 'घर', 90],
      ['pani', 'पानी', 89],
      ['khana', 'खाना', 87],
      ['bhaat', 'भात', 85],
      ['bhat', 'भात', 84],
      ['timi', 'तिमी', 86],
      ['timro', 'तिम्रो', 85],
      ['tapai', 'तपाईं', 92],
      ['tapaiko', 'तपाईंको', 90],
      ['sathi', 'साथी', 82],
      ['dhanyabad', 'धन्यवाद', 80],
      ['dhanyabaad', 'धन्यवाद', 79],
      ['chha', 'छ', 95],
      ['ho', 'हो', 95],
      ['hoina', 'होइन', 90],
      ['hunchha', 'हुन्छ', 92],
      ['gayo', 'गयो', 80],
      ['gardai', 'गर्दै', 78],
      ['lai', 'लाई', 88],
      ['ma', 'म', 96],
      ['ko', 'को', 97],
      ['hasnu', 'हँस्नु', 88],
      ['dukha', 'दुःख', 85],
      ['kasto', 'कस्तो', 88],
      ['kina', 'किन', 90],
      ['kahile', 'कहिले', 85],
      ['kata', 'कता', 86],
      ['hajur', 'हजुर', 92],
      ['thik', 'ठीक', 89],
      ['ram', 'राम', 90],
      ['shyam', 'श्याम', 88],
      ['hari', 'हरि', 87],
      ['sita', 'सीता', 88],
      ['gita', 'गीता', 88],
      ['desh', 'देश', 89],
      ['kaam', 'काम', 90],
      ['kam', 'कम', 80],
      ['aaja', 'आज', 92],
      ['bholi', 'भोलि', 90],
      ['hijo', 'हिजो', 88],
      ['manchhe', 'मान्छे', 87],
      ['kura', 'कुरा', 89],
      ['dherai', 'धेरै', 91],
      ['thore', 'थोरै', 85],
      ['thorai', 'थोरै', 86],
    ];

    for (const [r, d, f] of seed) {
      this.trie.insert(r, d, f);
    }
  }

  loadCustomLexicon(lexiconObj: Record<string, string>): void {
    for (const [r, d] of Object.entries(lexiconObj)) {
      this.trie.insert(r, d, 99);
    }
  }

  /**
   * Deterministic Phonetic Transliteration via FSM
   */
  transliteratePhonetic(rawWord: string): string {
    if (!rawWord) return '';
    const input = rawWord.toLowerCase();
    let cursor = 0;
    let result = '';
    let state: 'START' | 'CONSONANT' | 'VOWEL' | 'MODIFIER' = 'START';

    while (cursor < input.length) {
      // 1. Numerals Check (0-9)
      const char = input[cursor];
      if (this.numerals[char]) {
        result += this.numerals[char];
        cursor++;
        state = 'START';
        continue;
      }

      // 2. Modifiers Check (Chandrabindu **, ~n, Anusvara *, Visarga :)
      let matchedModifier: string | null = null;
      let modLen = 0;
      for (let len = 2; len >= 1; len--) {
        const slice = input.slice(cursor, cursor + len);
        if (this.modifiers[slice]) {
          matchedModifier = this.modifiers[slice];
          modLen = len;
          break;
        }
      }

      if (matchedModifier) {
        result += matchedModifier;
        cursor += modLen;
        state = 'MODIFIER';
        continue;
      }

      // 3. Consonant Matching
      let matchedConsonant: string | null = null;
      let matchedConsLen = 0;
      for (let len = 4; len >= 1; len--) {
        const slice = input.slice(cursor, cursor + len);
        if (this.consonants[slice]) {
          matchedConsonant = this.consonants[slice];
          matchedConsLen = len;
          break;
        }
      }

      if (matchedConsonant) {
        if (state === 'CONSONANT') {
          result += this.virama; // Two consonants back-to-back trigger halanta
        }
        result += matchedConsonant;
        cursor += matchedConsLen;
        state = 'CONSONANT';
        continue;
      }

      // 4. Vowel Matching (Matra vs Independent)
      let matchedVowelKey: string | null = null;
      let matchedVowLen = 0;
      for (let len = 3; len >= 1; len--) {
        const slice = input.slice(cursor, cursor + len);
        if (this.matras[slice] !== undefined || this.independentVowels[slice] !== undefined) {
          matchedVowelKey = slice;
          matchedVowLen = len;
          break;
        }
      }

      if (matchedVowelKey !== null) {
        if (state === 'CONSONANT') {
          result += this.matras[matchedVowelKey]; // Attach matra to preceding consonant
        } else {
          result += this.independentVowels[matchedVowelKey] || matchedVowelKey; // Standalone vowel
        }
        cursor += matchedVowLen;
        state = 'VOWEL';
        continue;
      }

      // 5. Fallback for unmapped characters (symbols, punctuation)
      result += input[cursor];
      cursor++;
      state = 'START';
    }

    return result;
  }

  transliterateWord(word: string): string {
    if (!word) return '';
    const clean = word.toLowerCase().trim();

    // Check exact lexicon match first
    const match = this.trie.lookup(clean);
    if (match) return match.devanagari;

    // Run FSM parser
    return this.transliteratePhonetic(clean);
  }

  getSuggestions(word: string, maxResults = 5): string[] {
    if (!word) return [];
    const clean = word.toLowerCase().trim();
    const suggestions: string[] = [];

    const exact = this.trie.lookup(clean);
    if (exact) suggestions.push(exact.devanagari);

    const fsmResult = this.transliteratePhonetic(clean);
    if (fsmResult && !suggestions.includes(fsmResult)) {
      suggestions.push(fsmResult);
    }

    const prefixMatches = this.trie.findPrefixMatches(clean, maxResults);
    for (const match of prefixMatches) {
      if (!suggestions.includes(match)) {
        suggestions.push(match);
      }
    }

    return suggestions.slice(0, maxResults);
  }

  /**
   * Parses text chunks preserving delimiters, spaces, and punctuation
   */
  translateSentence(sentence: string): string {
    if (!sentence) return '';
    // Tokenize Roman words, digits, and modifier symbols vs punctuation/spaces
    const tokens = sentence.split(/([a-zA-Z0-9*~:]+)/);

    return tokens
      .map((token) => {
        if (/^[a-zA-Z0-9*~:]+$/.test(token)) {
          return this.transliterateWord(token);
        }
        return token;
      })
      .join('');
  }
}

// Singleton offline transliterator engine instance
export const offlineEngine = new RomanNepaliTransliterator();
