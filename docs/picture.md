# Picture.js Documentation
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repositorio-black?logo=github)](https://github.com/frikimirinda/picture)

A powerful JavaScript class for formatting, deformatting, and validating data using **picture strings** — compact format descriptors for strings, numbers, dates, times, and patterns.

---

## Table of Contents

- [Overview](#overview)
- [Picture String Syntax](#picture-string-syntax)
- [Quick Start](#quick-start)
- [Data Types](#data-types)
  - [S — String](#s--string)
  - [N — Number](#n--number)
  - [D — Date](#d--date)
  - [T — Time](#t--time)
  - [P — Pattern](#p--pattern)
- [Static API Methods](#static-api-methods)
  - [Picture.format(data, picture)](#pictureformatdata-picture)
  - [Picture.deformat(data, picture)](#picturedeformatdata-picture)
  - [Picture.isValid(data, picture)](#pictureisvaliddata-picture)
  - [Picture.picInfo(picture)](#picturepicinfopicture)
  - [Picture.removeFill(data, picture)](#pictureremovefilldata-picture)
  - [Picture.capitalize(s, all)](#picturecapitalizes-all)
- [DOM Integration](#dom-integration)
  - [Picture.initElement(el, pic)](#pictureinitelementel-pic)
  - [Element Methods](#element-methods)
  - [Event Handling](#event-handling)
- [Configuration](#configuration)
  - [Global Defaults](#global-defaults)
  - [Locale Settings](#locale-settings)
  - [Date Locale Data](#date-locale-data)
  - [String Locale Data](#string-locale-data)
- [Complete Examples](#complete-examples)
  - [Formatting Numbers](#formatting-numbers)
  - [Formatting Strings](#formatting-strings)
  - [Formatting Dates](#formatting-dates)
  - [Formatting Times](#formatting-times)
  - [Using Patterns](#using-patterns)
  - [DOM Integration Examples](#dom-integration-examples)
- [Picture String Reference](#picture-string-reference)
- [Date Format Specifiers](#date-format-specifiers)
- [Time Format Specifiers](#time-format-specifiers)
- [Pattern Placeholders](#pattern-placeholders)

---

## Overview

`Picture` is a **static-only** JavaScript class. All methods are called directly on the class — no instantiation needed. It provides three core capabilities:

1. **Formatting** — Transform raw data into display-ready strings.
2. **Deformatting** — Extract raw data back from formatted strings.
3. **Validation** — Check whether a value matches the constraints defined by a picture string.

Additionally, `Picture` can bind directly to DOM `<input>` elements, providing real-time keystroke validation, formatting on blur, and deformatting on focus.

---

## Picture String Syntax

Every picture string starts with a **type character** followed by **type-specific format tokens**:

```
<TYPE><FORMAT>
```

| Type | Description | Example Picture | Input | Output |
|------|------------|----------------|-------|--------|
| `S`  | String     | `S20U`         | `"hello"` | `"HELLO"` |
| `N`  | Number     | `N.6,2`        | `1234.5` | `1.234,50` |
| `D`  | Date       | `D1`           | `"2024-03-15"` | `"15/03/2024"` |
| `T`  | Time       | `T1`           | `"14:30:00"` | `"14:30:00"` |
| `P`  | Pattern    | `P##~-~###`    | `"12345"` | `"12-345"` |

---

## Quick Start

```html
<script src="picture.js"></script>
<script>
  // Format a number with thousands separator and 2 decimals
  Picture.format(1234567.89, 'N.10,2');
  // => "1.234.567,89"

  // Format a date
  Picture.format('2024-03-15', 'D1');
  // => "15/03/2024"

  // Validate an input
  Picture.isValid('12:30', 'T2');
  // => true

  // Bind to a DOM input
  Picture.initElement(document.getElementById('price'), 'N$>09,2');
</script>
```

---

## Data Types

### S — String

**Syntax:** `S<SIZE><CASE>`

| Token | Position | Description | Values |
|-------|----------|-------------|--------|
| `SIZE` | Required | Maximum character length | Any positive integer |
| `CASE` | Optional | Case transformation | `U` = UPPERCASE, `L` = lowercase, `C` = Capitalize first, `A` = Capitalize All Words |

**Advanced syntax with custom regex:**

```
S<SIZE><CASE>~REAC~<regex>~REVA~<regex>~RETY~<regex>
```

| Token | Description |
|-------|-------------|
| `REAC` | Regex for allowed characters (per keystroke) |
| `REVA` | Regex for full-field validation |
| `RETY` | Regex for typing validation |

#### Examples

```js
// Simple: 50 chars, uppercase
Picture.format('hello world', 'S50U');
// => "HELLO WORLD"

// Lowercase
Picture.format('Hello World', 'S50L');
// => "hello world"

// Capitalize first word
Picture.format('hello world', 'S50C');
// => "Hello world"

// Capitalize all words
Picture.format('hello world', 'S50A');
// => "Hello World"

// Truncate to size
Picture.format('abcdefghij', 'S5');
// => "abcde"

// Deformat preserves case
Picture.deformat('HELLO', 'S50U');
// => "HELLO"
```

---

### N — Number

**Syntax:** `N<CURRENCY><CURRENCY_POS><THOUSANDS_SEP><SIGN><SIGN_POS><FILL><SIZE><DECIMALS_SEP><DECIMALS><BLANK_IF_ZERO><ALIGN>`

| Token | Position | Description | Values | Default |
|-------|----------|-------------|--------|---------|
| `CURRENCY` | Optional | Currency symbol | `$`, `€`, `£`, `¥`, `%`, or custom in `~tildes~` | (none) |
| `CURRENCY_POS` | Optional | Currency position | `<` = before, `>` = after | `>` |
| `THOUSANDS_SEP` | Optional | Thousands separator | `.`, `,`, `_` | (none) |
| `SIGN` | Optional | Negative sign style | `-`, `+`, `[`, `(` | `-` |
| `SIGN_POS` | Optional | Sign position | `<` = before, `>` = after | `<` |
| `FILL` | Optional | Left padding character | `0`, `_`, `*` | (none) |
| `SIZE` | Required | Total digit width | Any positive integer | — |
| `DECIMALS_SEP` | Optional | Decimal separator | `.`, `,`, `_` | `,` |
| `DECIMALS` | Optional | Decimal places | Any positive integer | `0` |
| `BLANK_IF_ZERO` | Optional | Return empty string for zero | `B` | (none) |
| `ALIGN` | Optional | Text alignment (DOM only) | `L`, `C`, `R` | (none) |

#### Examples

```js
// Basic integer: 6-digit number
Picture.format(1234, 'N6');
// => "1234"

// With thousands separator (dot) and 2 decimals (comma)
Picture.format(1234567.89, 'N.10,2');
// => "1.234.567,89"

// Zero-padded: 8 digits, zero-filled
Picture.format(42, 'N08');
// => "00000042"

// Currency before the number
Picture.format(1500, 'N$<.8,2');
// => "$1.500,00"

// Currency after the number
Picture.format(1500, 'N€>.8,2');
// => "1.500,00€"

// Custom currency name
Picture.format(1500, 'N~USD~>.8,2');
// => "1.500,00USD"

// Percentage
Picture.format(85.5, 'N%>4,1');
// => "85,5%"

// Negative with brackets
Picture.format(-1500, 'N[.8,2');
// => "[1.500,00]"

// Negative with parentheses
Picture.format(-1500, 'N(.8,2');
// => "(1.500,00)"

// Suppress positive sign (show nothing for negatives)
Picture.format(-1500, 'N+.8,2');
// => "1.500,00"

// Negative sign after the number
Picture.format(-42, 'N->6');
// => "42-"

// Blank if zero
Picture.format(0, 'N6B');
// => ""

// Deformat: get raw number back
Picture.deformat('1.234,50', 'N.8,2');
// => 1234.5

// Remove padding
Picture.removeFill('00000042', 'N08');
// => 42
```

---

### D — Date

**Syntax:** `D<FORMAT><SEPARATOR>`

The `FORMAT` is either a **preset number** (1–11) or a **custom format string** using PHP-style date tokens.

The input data must be in **ISO format** `YYYY-MM-DD`.

#### Preset Formats

| Preset | Pattern | Example Output |
|--------|---------|---------------|
| `1` | `d/m/Y` | `15/03/2024` |
| `2` | `d/m/y` | `15/03/24` |
| `3` | `m/d/Y` | `03/15/2024` |
| `4` | `m/d/y` | `03/15/24` |
| `5` | `Y/m/d` | `2024/03/15` |
| `6` | `Y/d/m` | `2024/15/03` |
| `7` | `l d de F de Y` | `Viernes 15 de Marzo de 2024` |
| `8` | `l d de F Y (semana W)` | `Viernes 15 de Marzo 2024 (semana 11)` |
| `9` | `F j, Y` | `March 15, 2024` |
| `10` | `j F Y` | `15 March 2024` |
| `11` | `l, F j, Y` | `Friday, March 15, 2024` |

> **Note:** Presets 7 and 8 contain Spanish literal text (`de`, `semana`). Month/day names depend on the `DATE_LNG` configuration.

#### Custom Separator

When using presets, the default separator `/` can be overridden:

```
D1-    →  15-03-2024   (dash separator)
D1.    →  15.03.2024   (dot separator)
```

#### Date Format Tokens

| Token | Description | Example |
|-------|-------------|---------|
| `d` | Day with leading zero | `01`–`31` |
| `j` | Day without leading zero | `1`–`31` |
| `m` | Month with leading zero | `01`–`12` |
| `n` | Month without leading zero | `1`–`12` |
| `Y` | 4-digit year | `2024` |
| `y` | 2-digit year | `24` |
| `z` | Day of the year | `0`–`365` |
| `D` | Short day name | `Sun`–`Sat` |
| `l` | Full day name | `Sunday`–`Saturday` |
| `N` | ISO day of week | `1` (Mon) – `7` (Sun) |
| `w` | Day of week | `0` (Sun) – `6` (Sat) |
| `W` | ISO week of year | `1`–`52` |
| `F` | Full month name | `January`–`December` |
| `M` | Short month name | `Jan`–`Dec` |
| `t` | Days in month | `28`–`31` |
| `L` | Leap year flag | `0` or `1` |

**Injecting literal text:** wrap text in `~tildes~`:

```
l d ~of~ F ~of~ Y  →  Friday 15 of March of 2024
```

#### Examples

```js
// Preset 1: dd/mm/YYYY
Picture.format('2024-03-15', 'D1');
// => "15/03/2024"

// Preset 1 with dash separator
Picture.format('2024-03-15', 'D1-');
// => "15-03-2024"

// Preset 9: Full month name
Picture.format('2024-03-15', 'D9');
// => "March 15, 2024"   (when DATE_LNG = 'EN')
// => "Marzo 15, 2024"   (when DATE_LNG = 'ES')

// Preset 11: Full day and month names
Picture.format('2024-03-15', 'D11');
// => "Friday, March 15, 2024"

// Custom format string
Picture.format('2024-03-15', 'Dd~-~M~-~Y');
// Custom format: "15-Mar-2024"
```

---

### T — Time

**Syntax:** `T<FORMAT><SEPARATOR>`

The `FORMAT` is either a **preset number** or a custom format string.

Input data must be in `HH:MM:SS` or `HH:MM` colon-separated format.

#### Preset Formats

| Preset | Pattern | Example Output |
|--------|---------|---------------|
| `1` | `H:i:s` | `14:30:00` |
| `2` | `H:i` | `14:30` |

#### Time Format Tokens

| Token | Description | Example |
|-------|-------------|---------|
| `H` | 24h hour with leading zero | `00`–`23` |
| `G` | 24h hour without leading zero | `0`–`23` |
| `g` | 12h hour without leading zero | `1`–`12` |
| `i` | Minutes with leading zero | `00`–`59` |
| `s` | Seconds with leading zero | `00`–`59` |
| `A` | AM/PM uppercase | `AM`, `PM` |
| `a` | am/pm lowercase | `am`, `pm` |

#### Examples

```js
// Preset 1: HH:MM:SS
Picture.format('14:30:00', 'T1');
// => "14:30:00"

// Preset 2: HH:MM
Picture.format('14:30:00', 'T2');
// => "14:30"

// With dot separator
Picture.format('14:30:00', 'T1.');
// => "14.30.00"

// AM/PM format (custom)
Picture.format('14:30:00', 'Tg:i A');
// => "2:30 PM"
```

---

### P — Pattern

**Syntax:** `P<FORMAT>`

Patterns define a fixed-position input mask. Each character in the format string is either a **placeholder** (replaced by user input) or a **literal** (displayed as-is).

#### Pattern Placeholders

| Placeholder | Description | Matches |
|-------------|-------------|---------|
| `#` | Required digit | `0`–`9` |
| `<` | Optional digit (space if empty) | `0`–`9` or space |
| `A` | Required uppercase letter (with space) | `A`–`Z`, space |
| `a` | Required lowercase letter (with space) | `a`–`z`, space |
| `Â` | Required uppercase letter (no space) | `A`–`Z` |
| `â` | Required lowercase letter (no space) | `a`–`z` |
| `*` | Any character | `.` (any) |
| `~text~` | Literal text (injected as-is) | — |

> **Note:** The character sets for `A`, `a`, `Â`, and `â` depend on `STRING_LNG`. For `'ES'`, they include `Ñ` and `ñ`.

#### Examples

```js
// Phone: (###) ###-####
Picture.format('1234567890', 'P~(~###~) ~###~-~####');
// => "(123) 456-7890"

// Deformat: get raw data back
Picture.deformat('(123) 456-7890', 'P~(~###~) ~###~-~####');
// => "1234567890"

// SSN: ###-##-####
Picture.format('123456789', 'P###~-~##~-~####');
// => "123-45-6789"

// Credit card: ####-####-####-####
Picture.format('1234567812345678', 'P####~-~####~-~####~-~####');
// => "1234-5678-1234-5678"

// License plate (Spain): ####AAA
Picture.format('1234ABC', 'P####ÂÂÂ');
// => "1234ABC"

// Mixed: AA-####
Picture.format('AB1234', 'PÂÂ~-~####');
// => "AB-1234"

// IP address-like: ###.###.###.###
Picture.format('192168001001', 'P###~.~###~.~###~.~###');
// => "192.168.001.001"

// Validation
Picture.isValid('(123) 456-7890', 'P~(~###~) ~###~-~####');
// => true

Picture.isValid('(12X) 456-7890', 'P~(~###~) ~###~-~####');
// => false
```

---

## Static API Methods

### Picture.format(data, picture)

Formats raw data according to a picture string.

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | `string \| number` | The raw data to format |
| `picture` | `string` | A valid picture string |

**Returns:** `string` — The formatted value, or `false` if the picture is invalid.

```js
Picture.format(1234.5, 'N.8,2');    // => "1.234,50"
Picture.format('hello', 'S10U');     // => "HELLO"
Picture.format('2024-03-15', 'D1');  // => "15/03/2024"
Picture.format('14:30:00', 'T2');    // => "14:30"
```

---

### Picture.deformat(data, picture)

Extracts the raw value from a formatted string.

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | `string` | The formatted value |
| `picture` | `string` | The picture string used for formatting |

**Returns:** `string \| number` — The raw value. Numbers return a `number` type; other types return `string`.

```js
Picture.deformat('1.234,50', 'N.8,2');     // => 1234.5
Picture.deformat('HELLO', 'S10U');          // => "HELLO"
Picture.deformat('(123) 456-7890', 'P~(~###~) ~###~-~####'); // => "1234567890"
```

---

### Picture.isValid(data, picture)

Tests whether a value satisfies the constraints defined by a picture string.

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | `string` | The value to validate |
| `picture` | `string` | The picture string |

**Returns:** `boolean`

```js
Picture.isValid('12345', 'N5');      // => true
Picture.isValid('123456', 'N5');     // => false (exceeds size)
Picture.isValid('12:30', 'T2');      // => true
Picture.isValid('25:00', 'T2');      // => false
```

---

### Picture.picInfo(picture)

Returns the parsed metadata object for a picture string. Useful for inspecting the internal representation.

| Parameter | Type | Description |
|-----------|------|-------------|
| `picture` | `string` | A valid picture string |

**Returns:** `object \| false` — An object with all parsed tokens and generated regex patterns, or `false` if invalid.

```js
const info = Picture.picInfo('N$.8,2');
// info.TYPE          => "N"
// info.CURRENCY      => "$"
// info.SIZE          => "8"
// info.DECIMALS      => "2"
// info.THOUSANDS_SEP => "."
// info.DECIMALS_SEP  => ","
// info.PATTERN       => "[0-9\\-\\.]"
// info.PATTERNVALRE  => /^...$/ (validation regex)
```

---

### Picture.removeFill(data, picture)

Removes the left-padding (fill) characters from a formatted number and returns the numeric value.

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | `string` | The padded formatted value |
| `picture` | `string` | The picture string |

**Returns:** `number`

```js
Picture.removeFill('00000042', 'N08');  // => 42
Picture.removeFill('***1234', 'N*7');   // => 1234
```

---

### Picture.capitalize(s, all)

Capitalizes a string.

| Parameter | Type | Description |
|-----------|------|-------------|
| `s` | `string` | The input string |
| `all` | `any` | If `null`/`undefined`, capitalizes only the first letter. If any other value, capitalizes the first letter of every word. |

**Returns:** `string`

```js
Picture.capitalize('hello world');     // => "Hello world"
Picture.capitalize('hello world', 1);  // => "Hello World"
```

---

## DOM Integration

### Picture.initElement(el, pic)

Binds a picture to an HTML input element. This adds automatic formatting, deformatting, validation, and input masking.

| Parameter | Type | Description |
|-----------|------|-------------|
| `el` | `HTMLElement` | The input element |
| `pic` | `string` (optional) | Picture string. If omitted, reads from the element's `pic` attribute. |

```html
<input type="text" id="price" pic="N$.10,2" value="1500" />
<input type="text" id="name"  pic="S50U" value="john" />
<input type="text" id="phone" pic="P~(~###~) ~###~-~####" value="" />

<script>
  Picture.initElement(document.getElementById('price'));
  Picture.initElement(document.getElementById('name'));
  Picture.initElement(document.getElementById('phone'));
</script>
```

After initialization, the element's display value is automatically formatted. The raw value is stored in the `value` attribute.

---

### Element Methods

After calling `initElement`, the following methods are added to the DOM element:

#### el.val(v)

Get or set the **raw** (deformatted) value.

```js
const el = document.getElementById('price');
Picture.initElement(el, 'N$.10,2');

// Get raw value
el.val();       // => 1500 (number)

// Set raw value (display updates automatically)
el.val(2500);   // display shows "$2.500,00"
```

#### el.format(val, pic)

Format a value. If called with no arguments, re-formats the current value.

```js
el.format();          // re-format current value with current picture
el.format(999);       // format 999 with current picture
el.format(999, 'N6'); // format 999 with a different picture
```

#### el.isvalid(v)

Check if a value (or the current value) passes validation.

```js
el.isvalid();         // validate current value
el.isvalid('abc');    // validate a specific value
// => true or false
```

#### el.isempty()

Check if the element is logically empty (empty string or numeric zero).

```js
el.isempty();  // => true if value is "" or 0 for numbers
```

#### el.deformat(data) *(Pattern type only)*

Deformat the current value or a given string, stripping pattern literals.

```js
// For a phone input with picture P~(~###~) ~###~-~####
el.deformat();                    // deformat current value
el.deformat('(123) 456-7890');    // => "1234567890"
```

---

### Event Handling

`initElement` attaches the following event listeners automatically:

| Event | Behavior |
|-------|----------|
| **focus** | Deformats the value for editing (numbers, strings). For patterns, places the cursor at the first input position. For numbers, applies text alignment. |
| **blur** | Re-formats the value for display. Sets an `isvalid` attribute on date/time fields. |
| **keypress** | Validates each keystroke against the allowed character set and typing regex. Blocks invalid keys. |
| **change** | Updates the `value` attribute and sets `isvalid`. |
| **paste** | Validates pasted data. For strings, truncates to max size. Blocks invalid paste content. |
| **click** *(Pattern only)* | Snaps the cursor to the next editable position. |
| **keydown** *(Pattern only)* | Handles Backspace, Delete, Home, Left, and Right keys with pattern-aware cursor movement. |

#### CSS Effects

- **String with CASE:** Applies `text-transform` CSS automatically (`uppercase`, `lowercase`, `capitalize`).
- **Number with ALIGN:** On focus, applies `text-align` (`right`, `center`, or `left`). On blur, resets to `initial`.

---

## Configuration

### Global Defaults

These static properties control default behavior when a picture string omits optional tokens:

```js
Picture.CURRENCY_POS   = '>';   // Currency after the number
Picture.THOUSANDS_SEP  = '';    // No thousands separator
Picture.DECIMALS_SEP   = ',';   // Comma as decimal separator
Picture.SIGN           = '-';   // Minus sign for negatives
Picture.SIGN_POS       = '<';   // Sign before the number
Picture.DATE_SEPARATOR = '/';   // Slash for date separation
Picture.TIME_SEPARATOR = ':';   // Colon for time separation
```

#### Changing Defaults

```js
// Switch to US-style number formatting
Picture.THOUSANDS_SEP = ',';
Picture.DECIMALS_SEP  = '.';

// Now N.8.2 uses comma for thousands, dot for decimals
Picture.format(1234.5, 'N.8.2');
// => "1,234.50"
```

---

### Locale Settings

```js
Picture.DATE_LNG   = 'ES';  // Date language: 'EN' or 'ES'
Picture.STRING_LNG = 'ES';  // String/pattern language: 'EN' or 'ES'
```

Changing locale affects:
- Day and month names in date formatting
- Character sets for pattern placeholders (`A`, `a`, `Â`, `â`)

```js
// English dates
Picture.DATE_LNG = 'EN';
Picture.format('2024-03-15', 'D9');
// => "March 15, 2024"

// Spanish dates
Picture.DATE_LNG = 'ES';
Picture.format('2024-03-15', 'D9');
// => "Marzo 15, 2024"
```

---

### Date Locale Data

`Picture.DATE_CONFIG` contains locale-specific day/month names:

```js
Picture.DATE_CONFIG = {
  'EN': {
    'D': ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    'l': ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    'N': [1,2,3,4,5,6,7],
    'w': [0,1,2,3,4,5,6],
    'F': ['January','February','March', /* ... */ 'December'],
    'M': ['Jan','Feb','Mar', /* ... */ 'Dec'],
  },
  'ES': {
    'D': ['Dom','Lun','Mar','Mie','Jue','Vie','Sáb'],
    'l': ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
    'N': [7,1,2,3,4,5,6],
    'w': [0,1,2,3,4,5,6],
    'F': ['Enero','Febrero','Marzo', /* ... */ 'Diciembre'],
    'M': ['Ene','Feb','Mar', /* ... */ 'Dic'],
  }
};
```

You can add your own locale:

```js
Picture.DATE_CONFIG['FR'] = {
  'D': ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'],
  'l': ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
  'N': [7,1,2,3,4,5,6],
  'w': [0,1,2,3,4,5,6],
  'F': ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
  'M': ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'],
};
Picture.DATE_LNG = 'FR';
```

---

### String Locale Data

`Picture.STRING` defines character classes used in patterns:

```js
Picture.STRING = {
  'EN': { 'a': 'a-z',  'A': 'A-Z'  },
  'ES': { 'a': 'a-zñ', 'A': 'A-ZÑ' }
};
```

This means that in `ES` locale, pattern placeholders `A` and `a` accept `Ñ` and `ñ`.

---

## Complete Examples

### Formatting Numbers

```js
// Basic integer
Picture.format(42, 'N6');
// => "42"

// With 2 decimal places
Picture.format(42, 'N6,2');
// => "42,00"

// Thousands separator + decimals
Picture.format(1234567.891, 'N.10,2');
// => "1.234.567,89"

// Euro currency after number
Picture.format(99.9, 'N€>.6,2');
// => "99,90€"

// Dollar currency before number
Picture.format(99.9, 'N$<.6,2');
// => "$99,90"

// Custom currency (text)
Picture.format(1500, 'N~BTC~>.10,8');
// => "1.500,00000000BTC"

// Zero-padded
Picture.format(7, 'N05');
// => "00007"

// Star-padded
Picture.format(7, 'N*5');
// => "****7"

// Underscore-padded
Picture.format(7, 'N_5');
// => "____7"

// Blank when zero
Picture.format(0, 'N6,2B');
// => ""

// Bracket notation for negatives
Picture.format(-500, 'N[.8,2');
// => "[500,00]"

// Parenthesis notation for negatives
Picture.format(-500, 'N(.8,2');
// => "(500,00)"

// Deformat back to number
Picture.deformat('[500,00]', 'N[.8,2');
// => -500

Picture.deformat('$1.234,50', 'N$<.8,2');
// => 1234.5
```

### Formatting Strings

```js
Picture.format('hello world', 'S20');
// => "hello world"

Picture.format('hello world', 'S20U');
// => "HELLO WORLD"

Picture.format('HELLO WORLD', 'S20L');
// => "hello world"

Picture.format('hello world', 'S20C');
// => "Hello world"

Picture.format('hello world', 'S20A');
// => "Hello World"

// Truncation
Picture.format('a very long string', 'S10');
// => "a very lon"
```

### Formatting Dates

```js
const date = '2024-12-25';

Picture.DATE_LNG = 'EN';

Picture.format(date, 'D1');   // => "25/12/2024"
Picture.format(date, 'D2');   // => "25/12/24"
Picture.format(date, 'D3');   // => "12/25/2024"
Picture.format(date, 'D5');   // => "2024/12/25"
Picture.format(date, 'D9');   // => "December 25, 2024"
Picture.format(date, 'D10');  // => "25 December 2024"
Picture.format(date, 'D11');  // => "Wednesday, December 25, 2024"

// Dash separator
Picture.format(date, 'D1-');  // => "25-12-2024"

// Dot separator
Picture.format(date, 'D1.');  // => "25.12.2024"

// Spanish locale
Picture.DATE_LNG = 'ES';
Picture.format(date, 'D7');
// => "Miércoles 25 de Diciembre de 2024"

Picture.format(date, 'D8');
// => "Miércoles 25 de Diciembre 2024 (semana 52)"
```

### Formatting Times

```js
const time = '14:30:45';

Picture.format(time, 'T1');   // => "14:30:45"
Picture.format(time, 'T2');   // => "14:30"

// Dot separator
Picture.format(time, 'T1.');  // => "14.30.45"
```

### Using Patterns

```js
// US Phone
Picture.format('5551234567', 'P~(~###~) ~###~-~####');
// => "(555) 123-4567"

// Social Security Number
Picture.format('123456789', 'P###~-~##~-~####');
// => "123-45-6789"

// Date mask (manual)
Picture.format('25122024', 'P##~/ ~##~/ ~####');
// => "25/ 12/ 2024"

// Alphanumeric code
Picture.format('AB1234', 'PÂÂ~-~####');
// => "AB-1234"

// Partial input (spaces fill empty positions)
Picture.format('123', 'P#####');
// => "123  "

// Deformat strips literals
Picture.deformat('(555) 123-4567', 'P~(~###~) ~###~-~####');
// => "5551234567"

// Validation
Picture.isValid('(555) 123-4567', 'P~(~###~) ~###~-~####');
// => true
```

### DOM Integration Examples

```html
<!-- Price input: $, dot thousands, comma decimals, 2 decimal places -->
<input type="text" id="price" pic="N$<.10,2" value="1500.50" />

<!-- Name input: 50 chars, capitalize all words -->
<input type="text" id="name" pic="S50A" value="john doe" />

<!-- Date input: dd/mm/YYYY -->
<input type="text" id="date" pic="D1" value="2024-03-15" />

<!-- Phone with mask -->
<input type="text" id="phone" pic="P~(~###~) ~###~-~####" value="" />

<!-- Percentage, blank if zero -->
<input type="text" id="pct" pic="N%>5,2B" value="0" />

<script>
  // Initialize all picture inputs
  document.querySelectorAll('[pic]').forEach(el => {
    Picture.initElement(el);
  });

  // Read raw values
  document.getElementById('price').val();  // => 1500.5
  document.getElementById('name').val();   // => "John Doe"

  // Set values programmatically
  document.getElementById('price').val(2999.99);
  // Display: "$2.999,99"

  // Validate
  document.getElementById('phone').isvalid();
  // => true or false

  // Check empty
  document.getElementById('pct').isempty();
  // => true (value was 0 and blank-if-zero is set)
</script>
```

---

## Picture String Reference

### Complete Syntax Overview

```
STRING:  S<size>[U|L|C|A][~REAC~<regex>][~REVA~<regex>][~RETY~<regex>]
NUMBER:  N[currency][<|>][,._][[-+(][<|>][0_*]<size>[,._][decimals][B][L|C|R]
DATE:    D<preset|format>[separator]
TIME:    T<preset|format>[separator]
PATTERN: P<format>
```

### Number Picture Cheat Sheet

| Picture | Input | Output | Description |
|---------|-------|--------|-------------|
| `N6` | `1234` | `1234` | Plain integer |
| `N6,2` | `1234.5` | `1234,50` | 2 decimals |
| `N.8,2` | `1234.5` | `1.234,50` | Thousands + decimals |
| `N08` | `42` | `00000042` | Zero-padded |
| `N$<.8,2` | `1500` | `$1.500,00` | Dollar prefix |
| `N€>.8,2` | `1500` | `1.500,00€` | Euro suffix |
| `N[.8,2` | `-500` | `[500,00]` | Bracket negatives |
| `N(.8,2` | `-500` | `(500,00)` | Parenthesis negatives |
| `N6B` | `0` | `` | Blank if zero |
| `N6,2R` | `42` | `42,00` | Right-aligned (DOM) |

### Date Presets Quick Reference

| Picture | Output for `2024-03-15` |
|---------|------------------------|
| `D1` | `15/03/2024` |
| `D2` | `15/03/24` |
| `D3` | `03/15/2024` |
| `D4` | `03/15/24` |
| `D5` | `2024/03/15` |
| `D9` | `March 15, 2024` |
| `D11` | `Friday, March 15, 2024` |

---

## Date Format Specifiers

| Specifier | Description | Range/Example |
|-----------|-------------|---------------|
| `d` | Day of month, leading zero | `01`–`31` |
| `j` | Day of month, no leading zero | `1`–`31` |
| `m` | Month number, leading zero | `01`–`12` |
| `n` | Month number, no leading zero | `1`–`12` |
| `Y` | 4-digit year | `2024` |
| `y` | 2-digit year | `24` |
| `z` | Day of year | `0`–`365` |
| `D` | Short day name (locale) | `Mon`, `Lun` |
| `l` | Full day name (locale) | `Monday`, `Lunes` |
| `N` | ISO day of week | `1`(Mon)–`7`(Sun) |
| `w` | Day of week | `0`(Sun)–`6`(Sat) |
| `W` | ISO week number | `1`–`52` |
| `F` | Full month name (locale) | `January`, `Enero` |
| `M` | Short month name (locale) | `Jan`, `Ene` |
| `t` | Days in month | `28`–`31` |
| `L` | Leap year flag | `0` or `1` |
| `~text~` | Literal text injection | `~of~` → `of` |

---

## Time Format Specifiers

| Specifier | Description | Range/Example |
|-----------|-------------|---------------|
| `H` | 24h hour, leading zero | `00`–`23` |
| `G` | 24h hour, no leading zero | `0`–`23` |
| `g` | 12h hour, no leading zero | `1`–`12` |
| `i` | Minutes, leading zero | `00`–`59` |
| `s` | Seconds, leading zero | `00`–`59` |
| `A` | Uppercase AM/PM | `AM`, `PM` |
| `a` | Lowercase am/pm | `am`, `pm` |

---

## Pattern Placeholders

| Placeholder | Description | Character Class |
|-------------|-------------|----------------|
| `#` | Required digit | `[0-9]` |
| `<` | Optional digit | `[0-9 ]` |
| `A` | Uppercase letter + space | `[A-Z ]` (`[A-ZÑ ]` in ES) |
| `Â` | Uppercase letter, no space | `[A-Z]` (`[A-ZÑ]` in ES) |
| `a` | Lowercase letter + space | `[a-z ]` (`[a-zñ ]` in ES) |
| `â` | Lowercase letter, no space | `[a-z]` (`[a-zñ]` in ES) |
| `*` | Any character | `.` |
| `~text~` | Literal text (separator) | Displayed as-is |
