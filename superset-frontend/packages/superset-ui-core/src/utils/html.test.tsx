/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import {
  sanitizeHtml,
  isProbablyHTML,
  sanitizeHtmlIfNeeded,
  safeHtmlSpan,
  removeHTMLTags,
  isJsonString,
  getParagraphContents,
} from './html';

describe('sanitizeHtml', () => {
  it('should sanitize the HTML string', () => {
    const htmlString = '<script>alert("XSS")</script>';
    const sanitizedString = sanitizeHtml(htmlString);
    expect(sanitizedString).not.toContain('script');
  });
});

describe('isProbablyHTML', () => {
  it('should return true if the text contains HTML tags', () => {
    const htmlText = '<div>Some HTML content</div>';
    const isHTML = isProbablyHTML(htmlText);
    expect(isHTML).toBe(true);
  });

  it('should return false if the text does not contain HTML tags', () => {
    const plainText = 'Just a plain text';
    const isHTML = isProbablyHTML(plainText);
    expect(isHTML).toBe(false);

    const trickyText = 'a <= 10 and b > 10';
    expect(isProbablyHTML(trickyText)).toBe(false);
  });
});

describe('sanitizeHtmlIfNeeded', () => {
  it('should sanitize the HTML string if it contains HTML tags', () => {
    const htmlString = '<div>Some <b>HTML</b> content</div>';
    const sanitizedString = sanitizeHtmlIfNeeded(htmlString);
    expect(sanitizedString).toEqual(htmlString);
  });

  it('should return the string as is if it does not contain HTML tags', () => {
    const plainText = 'Just a plain text';
    const sanitizedString = sanitizeHtmlIfNeeded(plainText);
    expect(sanitizedString).toEqual(plainText);
  });
});

describe('safeHtmlSpan', () => {
  it('should return a safe HTML span when the input is HTML', () => {
    const htmlString = '<div>Some <b>HTML</b> content</div>';
    const safeSpan = safeHtmlSpan(htmlString);
    expect(safeSpan).toEqual(
      <span
        className="safe-html-wrapper"
        dangerouslySetInnerHTML={{ __html: htmlString }}
      />,
    );
  });

  it('should return the input string as is when it is not HTML', () => {
    const plainText = 'Just a plain text';
    const result = safeHtmlSpan(plainText);
    expect(result).toEqual(plainText);
  });
});

describe('removeHTMLTags', () => {
  it('should remove HTML tags from the string', () => {
    const input = '<p>Hello, <strong>World!</strong></p>';
    const output = removeHTMLTags(input);
    expect(output).toBe('Hello, World!');
  });

  it('should return the same string when no HTML tags are present', () => {
    const input = 'This is a plain text.';
    const output = removeHTMLTags(input);
    expect(output).toBe('This is a plain text.');
  });

  it('should remove nested HTML tags and return combined text content', () => {
    const input = '<div><h1>Title</h1><p>Content</p></div>';
    const output = removeHTMLTags(input);
    expect(output).toBe('TitleContent');
  });

  it('should handle self-closing tags and return an empty string', () => {
    const input = '<img src="image.png" alt="Image">';
    const output = removeHTMLTags(input);
    expect(output).toBe('');
  });

  it('should handle malformed HTML tags and remove only well-formed tags', () => {
    const input = '<div><h1>Unclosed tag';
    const output = removeHTMLTags(input);
    expect(output).toBe('Unclosed tag');
  });
});

describe('isJsonString', () => {
  it('valid JSON object', () => {
    const jsonString = '{"name": "John", "age": 30, "city": "New York"}';
    expect(isJsonString(jsonString)).toBe(true);
  });

  it('valid JSON array', () => {
    const jsonString = '[1, 2, 3, 4, 5]';
    expect(isJsonString(jsonString)).toBe(true);
  });

  it('valid JSON string', () => {
    const jsonString = '"Hello, world!"';
    expect(isJsonString(jsonString)).toBe(true);
  });

  it('invalid JSON with syntax error', () => {
    const jsonString = '{"name": "John", "age": 30, "city": "New York"';
    expect(isJsonString(jsonString)).toBe(false);
  });

  it('empty string', () => {
    const jsonString = '';
    expect(isJsonString(jsonString)).toBe(false);
  });

  it('non-JSON string', () => {
    const jsonString = '<p>Hello, <strong>World!</strong></p>';
    expect(isJsonString(jsonString)).toBe(false);
  });

  it('non-JSON formatted number', () => {
    const jsonString = '12345abc';
    expect(isJsonString(jsonString)).toBe(false);
  });
});

describe('getParagraphContents', () => {
  it('should return an object with keys for each paragraph tag', () => {
    const htmlString =
      '<div><p>First paragraph.</p><p>Second paragraph.</p></div>';
    const result = getParagraphContents(htmlString);
    expect(result).toEqual({
      p1: 'First paragraph.',
      p2: 'Second paragraph.',
    });
  });

  it('should return null if the string is not HTML', () => {
    const nonHtmlString = 'Just a plain text string.';
    expect(getParagraphContents(nonHtmlString)).toBeNull();
  });

  it('should return null if there are no <p> tags in the HTML string', () => {
    const htmlStringWithoutP = '<div><span>No paragraph here.</span></div>';
    expect(getParagraphContents(htmlStringWithoutP)).toBeNull();
  });

  it('should return an object with empty string for empty <p> tag', () => {
    const htmlStringWithEmptyP = '<div><p></p></div>';
    const result = getParagraphContents(htmlStringWithEmptyP);
    expect(result).toEqual({ p1: '' });
  });

  it('should handle HTML strings with nested <p> tags correctly', () => {
    const htmlStringWithNestedP =
      '<div><p>First paragraph <span>with nested</span> content.</p></div>';
    const result = getParagraphContents(htmlStringWithNestedP);
    expect(result).toEqual({
      p1: 'First paragraph with nested content.',
    });
  });
});
