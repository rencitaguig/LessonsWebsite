import React, { useEffect, useRef, useState } from 'react';
import { Platform, Text, View, StyleSheet } from 'react-native';
import { API_URL } from '../constants/api';
import { normalizePastedContent, convertPuaCharacters } from '../utils/contentPasteNormalizer';

interface RichContentEditorProps {
  value: string;
  onChange: (value: string) => void;
}

function cleanContentHtml(value: string) {
  return convertPuaCharacters(value)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<font\b[^>]*>/gi, '')
    .replace(/<\/font>/gi, '')
    .replace(/\sstyle\s*=\s*("[^"]*"|'[^']*')/gi, (match) => {
      let css = match.replace(/^\s*style\s*=\s*["']|["']$/gi, '');
      css = css.replace(/mso-[^;]+;?/gi, '').replace(/font-family\s*:\s*[^;]+;?/gi, '').trim();
      return css ? ` style="${css}"` : '';
    })
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript\s*:/gi, '');
}

export default function RichContentEditor({ value, onChange }: RichContentEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web' && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  if (Platform.OS !== 'web') {
    return <Text style={styles.nativeFallback}>{value}</Text>;
  }

  const handlePaste = async (event: React.ClipboardEvent<HTMLDivElement>) => {
    const selection = window.getSelection();
    const range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;

    const imageItem = Array.from(event.clipboardData.items).find((item) => item.type.startsWith('image/'));
    if (imageItem) {
      event.preventDefault();
      const file = imageItem.getAsFile();
      if (!file) return;

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('image', file, file.name || 'pasted-image.png');
        const response = await fetch(`${API_URL}/content-images`, { method: 'POST', body: formData });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Image upload failed');

        editorRef.current?.focus();
        if (range && selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
        const imageUrl = data.url.startsWith('http')
          ? data.url
          : `${API_URL.replace(/\/api$/, '')}${data.url}`;
        document.execCommand('insertHTML', false, `<img src="${imageUrl}" alt="Pasted image" />`);
        if (editorRef.current) onChange(cleanContentHtml(editorRef.current.innerHTML));
      } catch (error) {
        console.error(error);
        alert('Unable to upload pasted image.');
      } finally {
        setUploading(false);
      }
      return;
    }

    // Intercept non-image paste to convert formulas and special characters into literal text
    // while fully preserving rich formatting, spacing, indentation, and capitalization
    event.preventDefault();
    const normalized = normalizePastedContent(event.clipboardData);

    editorRef.current?.focus();
    if (range && selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }

    if (normalized.html) {
      if (range && selection) {
        range.deleteContents();
        const fragment = range.createContextualFragment(normalized.html);
        const lastNode = fragment.lastChild;
        range.insertNode(fragment);
        if (lastNode) {
          const newRange = document.createRange();
          newRange.setStartAfter(lastNode);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      } else {
        document.execCommand('insertHTML', false, normalized.html);
      }
    } else {
      document.execCommand('insertText', false, normalized.text);
    }

    if (editorRef.current) {
      onChange(cleanContentHtml(editorRef.current.innerHTML));
    }
  };

  return (
    <View>
      <div
        ref={editorRef}
        className="lesson-rich-content"
        contentEditable
        suppressContentEditableWarning
        onInput={(event) => onChange(cleanContentHtml(event.currentTarget.innerHTML))}
        onPaste={handlePaste}
        style={webEditorStyle}
      />
      <Text style={styles.hint}>{uploading ? 'Uploading pasted image...' : 'Paste text, formulas, or images directly into the content area.'}</Text>
    </View>
  );
}

const webEditorStyle: React.CSSProperties = {
  minHeight: 160,
  border: '1px solid #e2dce8',
  borderRadius: 9,
  padding: 14,
  backgroundColor: '#FAFAFC',
  color: '#1E1E24',
  fontFamily: 'Spline Sans',
  outlineStyle: 'none',
  overflowWrap: 'anywhere',
  whiteSpace: 'pre-wrap'
};

const styles = StyleSheet.create({
  hint: { color: '#64748b', fontSize: 12, marginTop: 6, fontFamily: 'Spline Sans' },
  nativeFallback: { color: '#334155', padding: 12, fontFamily: 'Spline Sans' }
});
