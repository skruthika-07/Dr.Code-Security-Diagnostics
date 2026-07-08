require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const rateLimit = require('express-rate-limit');
const Groq = require('groq-sdk');
const { Mistral } = require('@mistralai/mistralai');

const app = express();
app.use((req, res, next) => {
  res.setTimeout(280000);
  next();
});
const PORT = process.env.PORT || 3001;

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const allowedOrigins = [
  'http://localhost:5173',
  'https://dr-code-security-diagnostics.vercel.app'
];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }
});

const scanLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 });

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Robust JSON parser for AI responses: first tries a plain parse, then falls
// back to (1) flattening raw control characters and (2) escaping any
// backslash that isn't already a valid JSON escape sequence (this is what
// fixes things like an unescaped regex `\d` the AI wrote without doubling
// the backslash). Used everywhere we parse a Groq/Mistral response.
function safeJsonParse(rawText) {
  try {
    return JSON.parse(rawText);
  } catch (firstErr) {
    console.error('JSON parse failed, attempting cleanup:', firstErr.message);
    let cleaned = rawText.replace(/[\n\r\t]/g, ' ');
    cleaned = cleaned.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
    return JSON.parse(cleaned);
  }
}

function recalculateRiskScore(findings) {
  if (!findings || findings.length === 0) return 0;
  const weights = { Critical: 25, High: 15, Medium: 7, Low: 2 };
  let score = 0;
  for (const finding of findings) {
    score += weights[finding.severity] || 0;
  }
  return Math.min(100, score);
}

function applyAllFixes(content, findings) {
  if (!content) return null;
  let result = content;
  for (const f of findings || []) {
    const before = f.remediation_diff?.before;
    const after = f.remediation_diff?.after;
    if (before && after && result.includes(before)) {
      result = result.replace(before, after);
    }
  }
  return result;
}

function pickFullCorrectedCode(originalContent, correctedFullFile, findings) {
  if (
    correctedFullFile &&
    typeof correctedFullFile === 'string' &&
    correctedFullFile.length >= originalContent.length * 0.6
  ) {
    return correctedFullFile;
  }
  if (correctedFullFile) {
    console.warn('Mistral full-corrected-file looked truncated/short, falling back to string-splice merge.');
  }
  return applyAllFixes(originalContent, findings);
}

async function crossVerifyWithMistral(fileContent, findings) {
  if (!findings || findings.length === 0) return { additionalFindings: [], correctedFullFile: null };

  try {
    const findingsSummary = findings.map((f, i) => ({
      index: i,
      title: f.title,
      severity: f.severity,
      description: f.description,
      affected_line: f.affected_line,
      before: f.remediation_diff?.before || '',
      after: f.remediation_diff?.after || '',
    }));

    const prompt = `You are a second, independent security reviewer checking another AI's analysis of this code. You have three tasks. Return ONE valid JSON object covering all three, no markdown, no explanation outside the JSON.

TASK 1 — VERIFY PROPOSED FIXES: For each finding below that has an "after" fix, check whether it uses any function, API, or method that does not actually exist, or would not compile/run correctly. ALSO check whether the fix actually changes program behavior for the bad case it claims to fix, not just a message or label. If a fix only relabels a problem without changing what the code actually does with bad input, rewrite it so it genuinely changes behavior (e.g. skip/reject/handle the invalid case, not just describe it differently). If already correct and complete, return it unchanged. CRITICAL: every returned fix must be COMPLETE — never use "...", "// rest unchanged", or any placeholder to skip writing real code.

TASK 2 — CHECK FOR MISSED ISSUES (very high bar): Independently re-examine the full source code below, including its very first and very last lines (function/class signature lines are easy to skim past — check them explicitly). Only add a finding if ALL of these are true:
1. It is directly and immediately exploitable/present using only what is actually in this exact code — no assumption that some other unrelated vulnerability already exists elsewhere in the application.
2. It does not depend on phrases like "if an attacker could already inject..." or "if the DOM were already compromised by some other means..." — any finding whose justification depends on a separate, hypothetical vulnerability existing first is NOT valid here. Skip it.
3. It is not a duplicate or near-duplicate of an existing finding below.
4. You are highly confident a professional reviewer would flag this as a real, standalone issue on its own merits — this includes genuine syntax errors (missing colons, brackets, etc.) that the first reviewer missed, not just security vulnerabilities.

It is expected and CORRECT for "additional_findings" to be an empty array in most cases. Returning nothing is the right answer far more often than returning something. When in doubt, leave it out.

TASK 3 — PRODUCE THE COMPLETE CORRECTED FILE: Take the original source code below and apply every fix from Task 1 (use your corrected version where you fixed something, otherwise the originally proposed fix) plus any from Task 2, directly into the file, producing the ENTIRE file from its very first line to its very last line. Do NOT use ellipsis ("..."), do NOT skip or summarize unrelated lines — every single line of the original file must appear in your output, either unchanged or correctly fixed. The result MUST be syntactically valid in the file's own language: correct indentation, colons, brackets, and semicolons exactly as that language requires. If applying a fix to a region risks breaking syntax, use the safer, more conservative version of that fix instead. Before finalizing, double-check: if any fix changed how data is represented or compared anywhere (for example switching to hashed passwords, or changing a variable's expected shape), confirm every seed/sample value elsewhere in the file was updated consistently using that same transformation, not left as an unchanged or placeholder value — the example code must still actually succeed when run with its own sample input. This is the single most important task — a broken or permanently-failing file is worse than an unfixed one. In your JSON string for this field, escape every literal newline as \\n, every literal double-quote as \\", and every literal backslash (such as in a regex pattern) as \\\\.

EXISTING FINDINGS FROM FIRST REVIEWER:
${JSON.stringify(findingsSummary, null, 2)}

FULL SOURCE CODE:
${fileContent}

Return ONLY this exact JSON shape:
{
  "corrected_fixes": ["<complete corrected after-code for finding index 0, or unchanged if already correct, or empty string if that finding had no fix>", "..."],
  "additional_findings": [{"title":"","severity":"Critical|High|Medium|Low","cvss_score":0.0,"description":"","attack_narrative":"","affected_line":"","remediation_diff":{"before":"","after":""},"exploitability_confidence":"High|Medium|Low"}],
  "full_corrected_code": "<the complete corrected file as one string>"
}
"corrected_fixes" must have exactly ${findingsSummary.length} entries, in the same order as the findings above. "additional_findings" should usually be an empty array.`;

    const mistralResult = await mistral.chat.complete({
      model: 'mistral-large-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });
    const responseText = mistralResult.choices[0].message.content;
    console.log('RAW MISTRAL CROSS-CHECK RESPONSE:', responseText);

    const objMatch = responseText.match(/\{[\s\S]*\}/);
    if (!objMatch) return { additionalFindings: [], correctedFullFile: null };

    let parsed;
    try {
      parsed = safeJsonParse(objMatch[0]);
    } catch (parseErr) {
      console.error('Mistral cross-check JSON parse failed even after cleanup:', parseErr.message);
      return { additionalFindings: [], correctedFullFile: null };
    }

    if (Array.isArray(parsed.corrected_fixes)) {
      parsed.corrected_fixes.forEach((fix, i) => {
        const finding = findings[i];
        if (!finding?.remediation_diff?.after) return;
        if (fix && !fix.includes('...')) {
          finding.remediation_diff.after = fix;
        } else if (fix && fix.includes('...')) {
          console.warn('Mistral returned truncated fix code, keeping original instead:', finding.title);
        }
      });
    }

    const additionalFindings = Array.isArray(parsed.additional_findings) ? parsed.additional_findings : [];
    const existingTitles = new Set(findings.map(f => (f.title || '').toLowerCase()));
    const trulyNew = additionalFindings.filter(f => f.title && !existingTitles.has(f.title.toLowerCase()));

    if (trulyNew.length > 0) {
      console.log(`Mistral cross-check found ${trulyNew.length} issue(s) Groq missed:`, trulyNew.map(f => f.title));
    }

    return {
      additionalFindings: trulyNew,
      correctedFullFile: typeof parsed.full_corrected_code === 'string' ? parsed.full_corrected_code : null,
    };
  } catch (mistralErr) {
    console.error('Mistral cross-check failed:', mistralErr.message);
    return { additionalFindings: [], correctedFullFile: null };
  }
}

function buildAnalysisPrompt(fileContent) {
  return `You are a senior penetration tester and code reviewer. Analyze this code and return ONLY a valid JSON object with this exact structure.

Check the code in this exact priority order:

STEP 1 — SYNTAX/PARSE ERRORS FIRST: Check for syntax errors that would prevent the code from running or compiling at all (missing colons, missing or unbalanced parentheses/brackets, unterminated strings, indentation errors, etc). These are CERTAIN and must be reported as findings (severity Low, unless the syntax error itself directly enables a security issue) before anything else. Read every single line, including the very first line (function/class signature) and the very last line of the file — do not skim past these.

STEP 2 — RUNTIME BUGS & ROBUSTNESS: Check for guaranteed runtime errors and logic flaws given the actual values/calls present in the code as written (type mismatches, undefined variables, off-by-one errors, division by zero, wrong variable/function names, inverted or backwards conditionals, unhandled invalid input, etc). Only report these if they would actually trigger given the literal code shown — do not invent hypothetical inputs that aren't in the code.

FIX QUALITY REQUIREMENT FOR THIS STEP: your fix must resolve the actual underlying behavior, not just patch a visible symptom like a wrong message or label. Ask yourself this specific question before finalizing any Step 2 fix: "After my fix, does invalid/bad input actually get handled differently than valid input — or does the code just describe it differently while still processing it the same way?" If a bug is "the code detects something is wrong but then proceeds as if it were fine" (e.g. an invalid record still gets included in a total, a failed check doesn't stop execution, an out-of-range value is logged but still used), your fix MUST change what the code actually does with that case — skip it, reject it, clamp it, or otherwise change the resulting behavior — not just correct what gets printed or logged about it. A fix that only changes wording without changing behavior is incomplete and must not be submitted as-is.

STEP 3 — SECURITY VULNERABILITIES (apply strictly):
- Critical: remote code execution, full system compromise, or complete authentication bypass with no preconditions.
- High: any path to arbitrary code execution that requires a precondition (e.g. eval/exec on external input, unverified remote script execution via curl|bash, SQL/command injection, insecure deserialization). These are NEVER Medium, even if "just a script."
- Medium: information disclosure, weak cryptography, insecure permissions, or issues requiring significant attacker effort/access to exploit.
- Low: best-practice violations with minimal real-world exploitability.

Before answering, mentally check the code line-by-line in order, including the first and last lines. Report every issue that meets the guidance above — do not skip a finding just because it seems minor, and do not invent one that isn't clearly present. Your goal is a complete, exhaustive list, not a curated highlight reel.

FIX QUALITY REQUIREMENT FOR STEP 3: your "after" fix must fully resolve the issue named in the "title" and "description" — not a partial mitigation. If the issue is "missing checksum/signature verification," the fix MUST add real verification (e.g. comparing a sha256sum against a known-good value), not just change execution style.

GLOBAL CONSISTENCY REQUIREMENT (applies to every step above): If your fix changes how a piece of data is represented, encoded, formatted, or compared anywhere in the file — for example switching a plaintext value to a hashed value, renaming a variable, or changing a function's expected input shape — you must also update every other place in this same file that creates, seeds, or depends on that same data so the file remains internally consistent and would still actually succeed when run with its own example/demo input. Prefer deriving any updated sample/seed values directly using the same transformation you applied in the fix (e.g. hash the same known plaintext value with the same hashing call) rather than guessing or inventing a placeholder value. A fix that leaves the file permanently unable to succeed — such as comparing live input against sample data that was never actually transformed to match the new format — is an incomplete and unacceptable fix.

CRITICAL: any code you put inside "before" or "after" fields must have all double quotes escaped as \\", all newlines escaped as \\n, and any literal backslash (such as inside a regex pattern like \\d or \\s) escaped as \\\\ — so the JSON remains valid and parseable. Do not use unescaped quotes, raw line breaks, or lone backslashes inside any string value.
{
  "findings": [{"title":"","severity":"Critical|High|Medium|Low","cvss_score":0.0,"description":"","attack_narrative":"","affected_line":"line number(s), e.g. 42 or 42-45","remediation_diff":{"before":"the vulnerable code snippet","after":"the fixed/secure code snippet"},"exploitability_confidence":"High|Medium|Low"}],
  "root_cause_correlation": "",
  "overall_risk_score": 0,
  "summary": ""
}

Code to analyze:
${fileContent}`;
}

app.post('/api/analyze', scanLimiter, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const isImage = ['image/png', 'image/jpeg', 'image/jpg'].includes(req.file.mimetype);

  try {
    if (isImage) {
      const visionPrompt = `You are a senior code reviewer and security analyst. Read the code shown in this image carefully and analyze it in this exact priority order:

STEP 1 - SYNTAX/PARSE ERRORS FIRST: Check for syntax errors that would prevent the code from running at all (missing colons, unterminated strings, indentation errors, mismatched brackets, etc). These are CERTAIN and must be reported as Critical findings if present, before anything else.

STEP 2 - RUNTIME BUGS: Check for guaranteed runtime errors given the actual values/calls present in the code as written (type mismatches, undefined variables, etc). Only report these if they would actually trigger given the literal code shown — do not invent hypothetical inputs that aren't in the code.

STEP 3 - SECURITY VULNERABILITIES: Only label something a security "vulnerability" with a CVSS score if there is a real, identifiable attacker-facing input surface (user input, network input, file input, API parameters). If the code only uses hardcoded literals with no external input path, do NOT assign CVSS scores or attacker narratives — instead use severity "Low" and describe it as a code quality/robustness issue, not a vulnerability.

Do not speculate about hypothetical future versions of the code. Only report what is verifiably true about the exact code shown in the image.

Return ONLY a valid JSON object with this exact structure, with no markdown formatting, no code fences, and no explanation outside the JSON. CRITICAL: any code you put inside "before" or "after" fields must have all double quotes escaped as \\", all newlines escaped as \\n, and any literal backslash escaped as \\\\.
{
  "findings": [{"title":"","severity":"Critical|High|Medium|Low","cvss_score":0.0,"description":"","attack_narrative":"","affected_line":"line number(s), e.g. 42 or 42-45","remediation_diff":{"before":"the vulnerable code snippet","after":"the fixed/secure code snippet"},"exploitability_confidence":"High|Medium|Low"}],
  "root_cause_correlation": "",
  "overall_risk_score": 0,
  "summary": ""
}`;

      let visionText;
      try {
        const visionCompletion = await client.chat.completions.create({
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: visionPrompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
                  }
                }
              ]
            }
          ],
          temperature: 0.1,
          max_tokens: 4000
        });
        visionText = visionCompletion.choices[0].message.content;
      } catch (rateLimitErr) {
        console.error('Groq vision call failed:', rateLimitErr.message);
        return res.status(429).json({ error: 'Image analysis is temporarily rate-limited. Please wait a minute and try again.' });
      }
      console.log('RAW GROQ VISION RESPONSE:', visionText);

      const visionMatch = visionText.match(/\{[\s\S]*\}/);
      if (!visionMatch) return res.status(500).json({ error: 'Failed to parse image analysis' });
      const imageReport = safeJsonParse(visionMatch[0]);

      imageReport.overall_risk_score = recalculateRiskScore(imageReport.findings);

      return res.json(imageReport);
    }

    const fileContent = req.file.buffer.toString('utf8');
    const prompt = buildAnalysisPrompt(fileContent);

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 6000,
      temperature: 0
    });

    const text = completion.choices[0].message.content;
    console.log('RAW AI RESPONSE:', text);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'Failed to parse response' });

    const report = safeJsonParse(jsonMatch[0]);

    const { additionalFindings, correctedFullFile } = await crossVerifyWithMistral(fileContent, report.findings);
    if (additionalFindings.length > 0) {
      report.findings = [...(report.findings || []), ...additionalFindings];
    }
    report.overall_risk_score = recalculateRiskScore(report.findings);
    report.full_corrected_code = pickFullCorrectedCode(fileContent, correctedFullFile, report.findings);

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── GitHub OAuth + Repo Scan ──────────────────────────────────────────────

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || `http://localhost:${PORT}/auth/github/callback`;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const CODE_EXTENSIONS = [
  '.py', '.js', '.ts', '.jsx', '.tsx',
  '.java', '.cpp', '.c', '.cs', '.rb', '.go', '.rs', '.php',
  '.swift', '.kt', '.scala', '.sh', '.bash',
  '.txt', '.log', '.yml', '.yaml', '.json', '.xml', '.env',
];

app.get('/auth/github', (req, res) => {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_REDIRECT_URI,
    scope: 'repo',
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

app.get('/auth/github/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect(`${FRONTEND_URL}/?github_error=missing_code`);
  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_REDIRECT_URI,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error('GitHub token exchange failed:', tokenData);
      return res.redirect(`${FRONTEND_URL}/?github_error=token_exchange_failed`);
    }
    res.redirect(`${FRONTEND_URL}/?github_token=${tokenData.access_token}`);
  } catch (err) {
    console.error('GitHub OAuth callback error:', err.message);
    res.redirect(`${FRONTEND_URL}/?github_error=server_error`);
  }
});

function getGithubToken(req) {
  const auth = req.headers.authorization || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : null;
}

app.get('/api/github/repos', async (req, res) => {
  const token = getGithubToken(req);
  if (!token) return res.status(401).json({ error: 'Missing GitHub token' });
  try {
    const ghRes = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
    });
    if (!ghRes.ok) return res.status(ghRes.status).json({ error: 'Failed to fetch repos' });
    const repos = await ghRes.json();
    res.json(repos.map(r => ({
      name: r.name,
      fullName: r.full_name,
      owner: r.owner.login,
      defaultBranch: r.default_branch,
      private: r.private,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/github/files', async (req, res) => {
  const token = getGithubToken(req);
  const { owner, repo, branch } = req.query;
  if (!token) return res.status(401).json({ error: 'Missing GitHub token' });
  if (!owner || !repo || !branch) return res.status(400).json({ error: 'Missing owner/repo/branch' });
  try {
    const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
    });
    if (!ghRes.ok) return res.status(ghRes.status).json({ error: 'Failed to fetch file tree' });
    const data = await ghRes.json();
    const files = (data.tree || [])
      .filter(item => item.type === 'blob')
      .filter(item => CODE_EXTENSIONS.some(ext => item.path.toLowerCase().endsWith(ext)))
      .filter(item => !item.path.includes('node_modules/'))
      .map(item => ({ path: item.path, sha: item.sha }));
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/github/file-content', async (req, res) => {
  const token = getGithubToken(req);
  const { owner, repo, path: filePath, branch } = req.query;
  if (!token) return res.status(401).json({ error: 'Missing GitHub token' });
  if (!owner || !repo || !filePath) return res.status(400).json({ error: 'Missing owner/repo/path' });
  try {
    const ghRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}?ref=${branch || ''}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } }
    );
    if (!ghRes.ok) return res.status(ghRes.status).json({ error: 'Failed to fetch file content' });
    const data = await ghRes.json();
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    res.json({ content, sha: data.sha, path: data.path });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/analyze-github', async (req, res) => {
  const { content, filename } = req.body;
  if (!content) return res.status(400).json({ error: 'No content provided' });

  try {
    const prompt = buildAnalysisPrompt(content);
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 6000,
      temperature: 0
    });

    const text = completion.choices[0].message.content;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'Failed to parse response' });

    const report = safeJsonParse(jsonMatch[0]);

    const { additionalFindings, correctedFullFile } = await crossVerifyWithMistral(content, report.findings);
    if (additionalFindings.length > 0) {
      report.findings = [...(report.findings || []), ...additionalFindings];
    }
    report.overall_risk_score = recalculateRiskScore(report.findings);
    report.full_corrected_code = pickFullCorrectedCode(content, correctedFullFile, report.findings);

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/github/create-pr', async (req, res) => {
  const token = getGithubToken(req);
  if (!token) return res.status(401).json({ error: 'Missing GitHub token' });

  const { owner, repo, branch, path: filePath, sha, originalContent, findings } = req.body;
  if (!owner || !repo || !branch || !filePath || !sha || !originalContent) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const ghHeaders = { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' };

  try {
    let modifiedContent = originalContent;
    const applied = [];
    const skipped = [];
    for (const f of findings || []) {
      const before = f.remediation_diff?.before;
      const after = f.remediation_diff?.after;
      if (!before || !after) continue;
      if (modifiedContent.includes(before)) {
        modifiedContent = modifiedContent.replace(before, after);
        applied.push(f);
      } else {
        skipped.push(f);
      }
    }

    if (applied.length === 0) {
      return res.status(400).json({
        error: "No fixes could be automatically applied — the AI's before/after snippets did not exactly match the file content.",
      });
    }

    const baseRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`, { headers: ghHeaders });
    if (!baseRefRes.ok) return res.status(baseRefRes.status).json({ error: 'Failed to read base branch' });
    const baseRefData = await baseRefRes.json();
    const baseSha = baseRefData.object.sha;

    const newBranch = `drcode-fix-${Date.now()}`;
    const createRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      headers: { ...ghHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: `refs/heads/${newBranch}`, sha: baseSha }),
    });
    if (!createRefRes.ok) {
      const errData = await createRefRes.json();
      return res.status(createRefRes.status).json({ error: errData.message || 'Failed to create branch' });
    }

    const commitRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}`,
      {
        method: 'PUT',
        headers: { ...ghHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Dr. Code: fix ${applied.length} issue(s) in ${filePath}`,
          content: Buffer.from(modifiedContent, 'utf8').toString('base64'),
          sha,
          branch: newBranch,
        }),
      }
    );
    if (!commitRes.ok) {
      const errData = await commitRes.json();
      return res.status(commitRes.status).json({ error: errData.message || 'Failed to commit fix' });
    }

    const fixList = applied
      .map(f => `- **[${f.severity}]** ${f.title}${f.affected_line ? ` — line ${f.affected_line}` : ''}`)
      .join('\n');
    const skipList = skipped.length
      ? `\n\n### Not auto-applied (snippet didn't match exactly)\n${skipped.map(f => `- **[${f.severity}]** ${f.title}`).join('\n')}`
      : '';

    const prBody = `## 🩺 Dr. Code automated fix\n\nThis PR applies ${applied.length} automated fix(es) found during a Dr. Code security scan of \`${filePath}\`.\n\n### Fixes applied\n${fixList}${skipList}\n\n---\n*Generated automatically by Dr. Code. Please review before merging — AI-generated fixes should always be checked by a human.*`;

    const prRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      headers: { ...ghHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Dr. Code: fix ${applied.length} issue(s) in ${filePath}`,
        head: newBranch,
        base: branch,
        body: prBody,
      }),
    });
    if (!prRes.ok) {
      const errData = await prRes.json();
      return res.status(prRes.status).json({ error: errData.message || 'Failed to open pull request' });
    }
    const prData = await prRes.json();

    res.json({
      prUrl: prData.html_url,
      branch: newBranch,
      appliedCount: applied.length,
      skippedCount: skipped.length,
    });
  } catch (err) {
    console.error('create-pr error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Dr. Code backend listening on port ${PORT}`));