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
  console.log("Saving test cases batch with payload:", payload);
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
export async function runTestCase({ runID, testCaseIds }) {
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