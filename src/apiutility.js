const API_BASE = process.env.REACT_APP_API_BASE;

// Signup utility function
export async function signUpUser(userInfo) {
  const response = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userInfo),
  });
  let data;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw new Error(data.error || data || "Registration failed");
  }
  return data;
}

// Login utility function
export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) throw new Error("Login failed");
  return response.json();
}

export async function getProtectedData() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/protected`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Not authorized");
  return response.json();
}
export async function fetchProjects() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found, please login first");
  const response = await fetch(`${API_BASE}/projects`, 
    {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    
    }
  }
  );
  if (!response.ok) throw new Error("Failed to fetch projects");
  return await response.json();
}
// Add this function to your apiutility.js file

export async function addProject(projectName) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    
    },
    body: JSON.stringify({ projectName: projectName }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to add project");
  }

  return await response.json();
}
// Function to fetch releases from the API

export async function fetchReleases() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/releases`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json", 
    "Authorization": `Bearer ${token}`
  }
    });
  if (!response.ok) throw new Error("Failed to fetch releases");
  return await response.json();
}
//addRelease function to add a release to a project
export async function addRelease({ projectID, releaseName }) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/releases`, {
    method: "POST",
    headers: { "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
    },
    body: JSON.stringify({ projectID, releaseName }),
  });
  if (!response.ok) throw new Error("Failed to add release");
  return await response.json();
}
export async function fetchRuns() {
   const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/runs`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json", 
       "Authorization": `Bearer ${token}` 
}
    });
  if (!response.ok) throw new Error("Failed to fetch runs");
  return await response.json();
}

export async function addRun({ projectID, releaseID, runName }) {
   const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/runs`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}` 
     },
    body: JSON.stringify({ projectID, releaseID, runName }),
  });
  if (!response.ok) throw new Error("Failed to add run");
  return await response.json();
}
/**
 * Save test cases batch.
 * Payload must include runID, releaseID, projectID, testCaseName, and testSteps (array)
 */
export async function saveTestCasesBatch(payload) {
  const token = localStorage.getItem("token");
  //console.log("Saving test cases batch with payload:", payload);
  const response = await fetch(`${API_BASE}/testcases/batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  let data;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    console.log(data);
    throw new Error(data.error || data || "Failed to save test cases batch");
  }
  return data;
}
export async function getTestCases(runID) {
  const token = localStorage.getItem("token");
  // If your endpoint is filtered by runID, use: `${API_BASE}/testcases?runID=${runID}`
  // If not, just fetch all and filter in the frontend
  const response = await fetch(`${API_BASE}/testcases`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to fetch test cases");
  return await response.json();
}
export async function fetchTestCaseByIds(projectID, releaseID, runID, testCaseID) {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${API_BASE}/testcases/${projectID}/${releaseID}/${runID}/${testCaseID}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch test case details");
  return await response.json();
}
// ...other functions...

// Add this function at the bottom of your apiutility.js file
export async function runTestCase1({ runID, testCaseIds }) {
  const token = localStorage.getItem("token");
  // Note: testCaseId could be "T-00007", runID could be "N-00003"
  const response = await fetch(`${API_BASE}/runtestcase`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
       "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      runID,
      testCaseIds, // Ensure this is an array
    }),
  });
  let data;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }
  if (!response.ok) {
    throw new Error(data.error || data || "Failed to run test case");
  }
  return data;
}
// ...other imports and functions...

/**
 * Run the selected test cases and receive result objects for each.
 * @param {Object} params - { projectId, releaseId, runId, testCaseIds }
 * @returns {Promise<Array>} Array of RunTestCaseResult objects
 */
export async function runTestCase({ projectId, releaseId, runId, testCaseIds }) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/runtestcase`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      projectId,
      releaseId,
      runId,
      testCaseIds, // Ensure this is an array of strings
    }),
  });

  let data;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }
  if (!response.ok) {
    throw new Error(data.error || data || "Failed to run test case(s)");
  }
  console.log("Run test case response:", data);
  return data; // This will be an array of RunTestCaseResult objects
}

// ...existing code...

/**
 * Fetch run test case results by selected filters.
 * @param {string} projectId
 * @param {string} releaseId
 * @param {string} runId
 * @param {string} testCaseId
 * @returns {Promise<Array>} Array of RunTestCaseResult
 */
export async function fetchRunTestCaseResults(projectId, releaseId, runId, testCaseId) {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams({
    projectId,
    releaseId,
    runId,
    testCaseId,
  }).toString();

  const response = await fetch(
    `${API_BASE}/runtestcase/results?${params}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    }
  );
  let data;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }
  if (!response.ok) {
    throw new Error(data.error || data || "Failed to fetch run test case results");
  }
  return data;
}

export async function updateTestCaseById({ projectID, releaseID, runID, testCaseID, testCaseName, testSteps }) {
  const token = localStorage.getItem("token");
  // Prepare the batch request payload as expected by the backend
  const payload = {
    projectID,
    releaseID,
    runID,
    testCaseName,
    testSteps: testSteps.map(step => ({
      testSteps: step.testSteps,
      expectedResult: step.expectedResult,
      actualResult: step.actualResult,
      locatorType: step.locatorType,
      locatorValue: step.locatorValue,
      browserActions: step.browserActions ? [step.browserActions].flat().filter(Boolean) : [],
      testdata: step.testdata,
    })),
  };
  const response = await fetch(
    `${API_BASE}/testcases/${projectID}/${releaseID}/${runID}/${testCaseID}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  let data;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    throw new Error(data.error || data || "Failed to update test case");
  }
  return data;
}
export async function deleteTestCaseByIds(projectID, releaseID, runID, testCaseID) {
  const token = localStorage.getItem("token");
  const response = await fetch(
    `${process.env.REACT_APP_API_BASE}/testcases/${projectID}/${releaseID}/${runID}/${testCaseID}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      }
    }
  );
  let data;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }
  if (!response.ok) {
    throw new Error(data.error || data || "Failed to delete test case");
  }
  return data;
}