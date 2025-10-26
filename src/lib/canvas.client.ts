/**
 * Canvas LMS API Client
 * 
 * Provides methods to interact with Canvas LMS REST API.
 * Documentation: https://canvas.instructure.com/doc/api/
 */

interface CanvasConfig {
  baseUrl: string;
  accessToken: string;
}

export class CanvasAPIClient {
  private baseUrl: string;
  private accessToken: string;

  constructor(config: CanvasConfig) {
    // Remove trailing slash if present
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.accessToken = config.accessToken;
  }

  /**
   * Make a request to the Canvas API
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/api/v1${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text().catch(() => response.statusText);
      throw new Error(`Canvas API Error (${response.status}): ${error}`);
    }

    return response.json();
  }

  /**
   * Get paginated items following Canvas Link headers
   */
  private async getPaginated<T>(
    endpoint: string,
    options: RequestInit = {},
    perPage: number = 100
  ): Promise<T[]> {
    const separator = endpoint.includes('?') ? '&' : '?';
    let url = `${endpoint}${separator}per_page=${perPage}`;
    const allItems: T[] = [];

    while (url) {
      const response = await fetch(`${this.baseUrl}/api/v1${url}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.text().catch(() => response.statusText);
        throw new Error(`Canvas API Error (${response.status}): ${error}`);
      }

      const items = await response.json();
      allItems.push(...items);

      // Parse Link header for next page
      const linkHeader = response.headers.get('Link');
      const nextMatch = linkHeader?.match(/<([^>]+)>;\s*rel="next"/);
      
      if (nextMatch) {
        // Extract just the path and query from the full URL
        const nextUrl = new URL(nextMatch[1]);
        url = nextUrl.pathname.replace('/api/v1', '') + nextUrl.search;
      } else {
        url = '';
      }
    }

    return allItems;
  }

  // ==================== COURSES ====================

  /**
   * List courses for the current user
   * GET /api/v1/courses
   */
  async getCourses(params?: {
    enrollment_type?: 'teacher' | 'student' | 'ta' | 'observer' | 'designer';
    enrollment_state?: 'active' | 'invited_or_pending' | 'completed';
    include?: string[];
  }) {
    const queryParams = new URLSearchParams();
    if (params?.enrollment_type) queryParams.append('enrollment_type', params.enrollment_type);
    if (params?.enrollment_state) queryParams.append('enrollment_state', params.enrollment_state);
    if (params?.include) {
      params.include.forEach(item => queryParams.append('include[]', item));
    }

    const endpoint = `/courses?${queryParams.toString()}`;
    return this.getPaginated<any>(endpoint);
  }

  /**
   * Get a single course
   * GET /api/v1/courses/:id
   */
  async getCourse(courseId: string | number, include?: string[]) {
    const queryParams = new URLSearchParams();
    if (include) {
      include.forEach(item => queryParams.append('include[]', item));
    }

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.request<any>(`/courses/${courseId}${query}`);
  }

  // ==================== ASSIGNMENTS ====================

  /**
   * List assignments for a course
   * GET /api/v1/courses/:course_id/assignments
   */
  async getAssignments(courseId: string | number, include?: string[]) {
    const queryParams = new URLSearchParams();
    if (include) {
      include.forEach(item => queryParams.append('include[]', item));
    }

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.getPaginated<any>(`/courses/${courseId}/assignments${query}`);
  }

  /**
   * Get a single assignment
   * GET /api/v1/courses/:course_id/assignments/:id
   */
  async getAssignment(courseId: string | number, assignmentId: string | number) {
    return this.request<any>(`/courses/${courseId}/assignments/${assignmentId}`);
  }

  // ==================== MODULES ====================

  /**
   * List modules in a course
   * GET /api/v1/courses/:course_id/modules
   */
  async getModules(courseId: string | number, include?: string[]) {
    const queryParams = new URLSearchParams();
    if (include) {
      include.forEach(item => queryParams.append('include[]', item));
    }

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.getPaginated<any>(`/courses/${courseId}/modules${query}`);
  }

  /**
   * Get module items
   * GET /api/v1/courses/:course_id/modules/:module_id/items
   */
  async getModuleItems(courseId: string | number, moduleId: string | number) {
    return this.getPaginated<any>(`/courses/${courseId}/modules/${moduleId}/items`);
  }

  // ==================== FILES ====================

  /**
   * List files in a course
   * GET /api/v1/courses/:course_id/files
   */
  async getFiles(courseId: string | number, params?: {
    content_types?: string[];
    search_term?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.content_types) {
      params.content_types.forEach(type => queryParams.append('content_types[]', type));
    }
    if (params?.search_term) {
      queryParams.append('search_term', params.search_term);
    }

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.getPaginated<any>(`/courses/${courseId}/files${query}`);
  }

  /**
   * Get file details
   * GET /api/v1/files/:id
   */
  async getFile(fileId: string | number) {
    return this.request<any>(`/files/${fileId}`);
  }

  /**
   * Download file content
   */
  async downloadFile(fileId: string | number): Promise<Blob> {
    const file = await this.getFile(fileId);
    const response = await fetch(file.url);
    
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    return response.blob();
  }

  // ==================== PAGES ====================

  /**
   * List pages in a course
   * GET /api/v1/courses/:course_id/pages
   */
  async getPages(courseId: string | number) {
    return this.getPaginated<any>(`/courses/${courseId}/pages`);
  }

  /**
   * Get a single page
   * GET /api/v1/courses/:course_id/pages/:url
   */
  async getPage(courseId: string | number, pageUrl: string) {
    return this.request<any>(`/courses/${courseId}/pages/${pageUrl}`);
  }

  // ==================== SUBMISSIONS ====================

  /**
   * List submissions for an assignment
   * GET /api/v1/courses/:course_id/assignments/:assignment_id/submissions
   */
  async getSubmissions(
    courseId: string | number,
    assignmentId: string | number,
    include?: string[]
  ) {
    const queryParams = new URLSearchParams();
    if (include) {
      include.forEach(item => queryParams.append('include[]', item));
    }

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.getPaginated<any>(
      `/courses/${courseId}/assignments/${assignmentId}/submissions${query}`
    );
  }

  /**
   * Submit an assignment
   * POST /api/v1/courses/:course_id/assignments/:assignment_id/submissions
   */
  async submitAssignment(
    courseId: string | number,
    assignmentId: string | number,
    submission: {
      submission_type: 'online_text_entry' | 'online_url' | 'online_upload' | 'media_recording';
      body?: string;
      url?: string;
      file_ids?: string[];
    }
  ) {
    return this.request<any>(
      `/courses/${courseId}/assignments/${assignmentId}/submissions`,
      {
        method: 'POST',
        body: JSON.stringify({ submission }),
      }
    );
  }

  // ==================== ENROLLMENTS ====================

  /**
   * List enrollments for a course
   * GET /api/v1/courses/:course_id/enrollments
   */
  async getEnrollments(courseId: string | number, type?: string[]) {
    const queryParams = new URLSearchParams();
    if (type) {
      type.forEach(t => queryParams.append('type[]', t));
    }

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.getPaginated<any>(`/courses/${courseId}/enrollments${query}`);
  }

  // ==================== USER INFO ====================

  /**
   * Get current user profile
   * GET /api/v1/users/self
   */
  async getCurrentUser() {
    return this.request<any>(`/users/self`);
  }

  /**
   * Get user profile
   * GET /api/v1/users/:id
   */
  async getUser(userId: string | number) {
    return this.request<any>(`/users/${userId}`);
  }

  // ==================== DISCUSSION TOPICS ====================

  /**
   * List discussion topics in a course
   * GET /api/v1/courses/:course_id/discussion_topics
   */
  async getDiscussionTopics(courseId: string | number) {
    return this.getPaginated<any>(`/courses/${courseId}/discussion_topics`);
  }

  /**
   * Get a single discussion topic
   * GET /api/v1/courses/:course_id/discussion_topics/:topic_id
   */
  async getDiscussionTopic(courseId: string | number, topicId: string | number) {
    return this.request<any>(`/courses/${courseId}/discussion_topics/${topicId}`);
  }

  // ==================== CALENDAR EVENTS ====================

  /**
   * List calendar events
   * GET /api/v1/calendar_events
   */
  async getCalendarEvents(params?: {
    type?: 'event' | 'assignment';
    start_date?: string;
    end_date?: string;
    context_codes?: string[];
  }) {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.context_codes) {
      params.context_codes.forEach(code => queryParams.append('context_codes[]', code));
    }

    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.getPaginated<any>(`/calendar_events${query}`);
  }

  // ==================== GRADES ====================

  /**
   * Get grades for a user in a course
   * GET /api/v1/courses/:course_id/users/:user_id/enrollments
   */
  async getUserGrades(courseId: string | number, userId: string | number = 'self') {
    return this.request<any>(`/courses/${courseId}/users/${userId}/enrollments`);
  }
}

/**
 * Create a Canvas API client from user settings
 */
export function createCanvasClient(baseUrl: string, accessToken: string): CanvasAPIClient {
  return new CanvasAPIClient({ baseUrl, accessToken });
}

/**
 * Validate Canvas API credentials
 */
export async function validateCanvasCredentials(
  baseUrl: string,
  accessToken: string
): Promise<{ valid: boolean; user?: any; error?: string }> {
  try {
    const client = createCanvasClient(baseUrl, accessToken);
    const user = await client.getCurrentUser();
    return { valid: true, user };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
