console.log('%c========================================', 'color: blue; font-weight: bold');
console.log('%c BACKGROUND SCRIPT LOADED', 'color: blue; font-weight: bold; font-size: 16px');
console.log('%c========================================', 'color: blue; font-weight: bold');
console.log('Timestamp:', new Date().toLocaleTimeString());

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('%c[BACKGROUND] Message received', 'background: purple; color: white; padding: 2px 5px');
  console.log('[BACKGROUND] Request:', request);
  console.log('[BACKGROUND] Sender tab ID:', sender.tab ? sender.tab.id : 'unknown');
  
  if (request.action === 'evaluateComplexity') {
    console.log('[BACKGROUND] Action: evaluateComplexity');
    console.log('[BACKGROUND] Prompt to evaluate:', request.prompt.substring(0, 100) + '...');
    
    evaluatePrompt(request.prompt)
      .then(function(result) {
        console.log('%c[BACKGROUND] ✅ SUCCESS', 'background: green; color: white; padding: 2px 5px');
        console.log('[BACKGROUND] Result:', result);
        sendResponse({ success: true, data: result });
      })
      .catch(function(error) {
        console.log('%c[BACKGROUND] ❌ ERROR', 'background: red; color: white; padding: 2px 5px');
        console.error('[BACKGROUND] Error details:', error);
        console.error('[BACKGROUND] Error message:', error.message);
        console.error('[BACKGROUND] Error stack:', error.stack);
        sendResponse({ success: false, error: error.message });
      });
    
    return true;
  } else {
    console.warn('[BACKGROUND] Unknown action:', request.action);
  }
});

async function evaluatePrompt(prompt) {
  console.log('%c[API] Starting evaluation...', 'background: orange; color: white; padding: 2px 5px');
  
  try {
    // Step 1: Get API key
    console.log('[API] Step 1: Retrieving API key from storage...');
    const storage = await chrome.storage.sync.get(['geminiApiKey']);
    console.log('[API] Storage retrieved:', storage);
    
    if (!storage.geminiApiKey) {
      console.error('[API] ❌ No API key found in storage');
      throw new Error('API key not configured. Click extension icon to add it.');
    }
    
    const apiKey = storage.geminiApiKey;
    console.log('[API] ✅ API key found:', apiKey.substring(0, 10) + '...');
    
    // Step 2: Prepare request
    console.log('[API] Step 2: Preparing API request...');
    const evaluationPrompt = 'Evaluate the complexity of this prompt and respond with ONLY valid JSON in this format: {"complexity":"Low","reason":"brief explanation"}\n\nPrompt: "' + prompt + '"\n\nRules:\n- Use "Low" for simple questions or basic requests\n- Use "Medium" for moderate reasoning or structured tasks\n- Use "High" for complex multi-step reasoning or technical design\n\nRespond with ONLY the JSON, no other text.';
    
    console.log('[API] Evaluation prompt prepared (length:', evaluationPrompt.length, ')');
    console.log('[API] First 100 chars:', evaluationPrompt.substring(0, 100));
    
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey;
    console.log('[API] Target URL:', url.replace(apiKey, 'HIDDEN'));
    
    const requestBody = {
      contents: [{
        parts: [{
          text: evaluationPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 500
      },
      systemInstruction: {
        parts: [{
          text: "You are a JSON response generator. Always respond with valid JSON only, no thinking, no explanation."
        }]
      }
    };
    console.log('[API] Request body:', JSON.stringify(requestBody, null, 2));
    
    // Step 3: Make API call
    console.log('[API] Step 3: Calling Gemini API...');
    const startTime = Date.now();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    const elapsed = Date.now() - startTime;
    console.log('[API] Response received in', elapsed, 'ms');
    console.log('[API] Response status:', response.status);
    console.log('[API] Response ok:', response.ok);
    console.log('[API] Response headers:', response.headers);
    
    if (!response.ok) {
      console.error('[API] ❌ Response not OK');
      const errorData = await response.json();
      console.error('[API] Error response:', errorData);
      throw new Error('API request failed: ' + (errorData.error ? errorData.error.message : response.status));
    }
    
    // Step 4: Parse response
    console.log('[API] Step 4: Parsing response...');
    const data = await response.json();
    console.log('[API] Full API response:', JSON.stringify(data, null, 2));
    
    if (!data.candidates || !data.candidates[0]) {
      console.error('[API] ❌ No candidates in response');
      console.error('[API] Response data:', data);
      throw new Error('No response from API');
    }
    
    console.log('[API] Candidates count:', data.candidates.length);
    console.log('[API] First candidate:', data.candidates[0]);
    
    if (!data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error('[API] ❌ Invalid response structure');
      console.error('[API] Candidate:', data.candidates[0]);
      throw new Error('Invalid API response structure');
    }
    
    const textContent = data.candidates[0].content.parts[0].text;
    console.log('[API] Raw text response:', textContent);
    console.log('[API] Text length:', textContent.length);
    
    // Step 5: Clean and parse JSON
    console.log('[API] Step 5: Cleaning text...');
    let cleanedText = textContent.trim();
    console.log('[API] After trim:', cleanedText);
    
    cleanedText = cleanedText.replace(/```json/g, '');
    console.log('[API] After removing ```json:', cleanedText);
    
    cleanedText = cleanedText.replace(/```/g, '');
    console.log('[API] After removing ```:', cleanedText);
    
    cleanedText = cleanedText.replace(/\n/g, ' ');
    console.log('[API] After removing newlines:', cleanedText);
    
    cleanedText = cleanedText.trim();
    console.log('[API] Final cleaned text:', cleanedText);
    
    // Step 6: Extract JSON
    console.log('[API] Step 6: Extracting JSON...');
    let jsonResult;
    
    try {
      console.log('[API] Attempting direct JSON.parse...');
      jsonResult = JSON.parse(cleanedText);
      console.log('[API] ✅ Direct parse successful');
    } catch (parseError) {
      console.warn('[API] ⚠️ Direct parse failed:', parseError.message);
      console.log('[API] Attempting regex extraction...');
      
      const jsonMatch = cleanedText.match(/\{.*\}/);
      console.log('[API] Regex match result:', jsonMatch);
      
      if (jsonMatch) {
        console.log('[API] Matched JSON:', jsonMatch[0]);
        jsonResult = JSON.parse(jsonMatch[0]);
        console.log('[API] ✅ Regex parse successful');
      } else {
        console.error('[API] ❌ No JSON found in text');
        throw new Error('Could not extract JSON from response');
      }
    }
    
    console.log('[API] Parsed JSON result:', jsonResult);
    
    // Step 7: Validate and return
    console.log('[API] Step 7: Validating result...');
    
    if (!jsonResult.complexity) {
      console.warn('[API] ⚠️ No complexity field, defaulting to Medium');
      jsonResult.complexity = 'Medium';
    }
    
    if (!jsonResult.reason) {
      console.warn('[API] ⚠️ No reason field, using default');
      jsonResult.reason = 'Unable to determine specific reason';
    }
    
    const validComplexities = ['Low', 'Medium', 'High'];
    if (validComplexities.indexOf(jsonResult.complexity) === -1) {
      console.warn('[API] ⚠️ Invalid complexity value:', jsonResult.complexity);
      jsonResult.complexity = 'Medium';
    }
    
    const finalResult = {
      complexity: jsonResult.complexity,
      reason: jsonResult.reason
    };
    
    console.log('%c[API] ✅ EVALUATION COMPLETE', 'background: green; color: white; padding: 2px 5px; font-weight: bold');
    console.log('[API] Final result:', finalResult);
    
    // Save to database
    saveToDatabase(prompt, finalResult).catch(err => console.error('[DB] Save failed:', err));
    
    return finalResult;
    
  } catch (error) {
    console.log('%c[API] ❌ EXCEPTION CAUGHT', 'background: red; color: white; padding: 2px 5px; font-weight: bold');
    console.error('[API] Exception type:', error.name);
    console.error('[API] Exception message:', error.message);
    console.error('[API] Exception stack:', error.stack);
    throw error;
  }
}

async function saveToDatabase(prompt, result) {
  console.log('%c[DB] Starting database save...', 'background: blue; color: white; padding: 2px 5px');
  console.log('[DB] Prompt:', prompt.substring(0, 50) + '...');
  console.log('[DB] Result:', result);
  
  try {
    const payload = {
      prompt: prompt,
      complexity: result.complexity,
      reason: result.reason,
      timestamp: new Date().toISOString()
    };
    console.log('[DB] Payload:', payload);
    console.log('[DB] Sending to http://localhost:3000/api/save-complexity');
    
    const response = await fetch('http://localhost:3000/api/save-complexity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log('[DB] Response status:', response.status);
    console.log('[DB] Response ok:', response.ok);
    
    const data = await response.json();
    console.log('%c[DB] ✅ Saved successfully', 'background: green; color: white; padding: 2px 5px');
    console.log('[DB] Response data:', data);
  } catch (error) {
    console.error('%c[DB] ❌ Save failed', 'background: red; color: white; padding: 2px 5px');
    console.error('[DB] Error:', error);
    console.error('[DB] Error message:', error.message);
  }
}

console.log('[BACKGROUND] Script initialization complete');
console.log('[BACKGROUND] Waiting for messages from content script...');
