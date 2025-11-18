1.Add missing fields.phone reference in the fields object (validator used fields.phone, but the object did not have it.)
Added phone: document.getElementById('phone') into the fields object - this ensures the phone input is properly recognised and can be validated, saved, 
and restored like the other fields.

2.Fix debounce usage inside listeners.
The code "fields.name.addEventListener('input', () => { debounce(validateName, 150)(); buildSummary(); });" creates a new debounced function every time, giving no debouncing at all.
Created persistent debounced validator functions "(const debouncedName = debounce(validateName, 150))" and used these inside the listeners.

3.Phone normalisation on blur: added missing condition for empty input. 
The original code always rewrites the phone number even if the field was empty and it results in "+358" appearing when leaving the field.
Added a simple check: if the field is empty, do nothing and only normalise when there is input.It prevents unwanted auto-filling 
and keeps the behaviour consistent.

4.Security improvement: remove password from localStorage draft. Original saveDraft() stores it. 
To prevent this removed the password from the data saved to localStorage and ensured that the password field does not restore any stored value.

5.Summary output bug fix. Summary uses "problems.join('');" - this creates a broken string. 
Replaced the newline characters with <br> tags so the list of problems displays as separate lines in HTML.



