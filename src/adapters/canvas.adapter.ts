export interface CanvasCourse {
  id: string
  name: string
  course_code: string
  created_at: string
  workflow_state: string
}

export interface CanvasFile {
  id: string
  display_name: string
  filename: string
  'content-type': string
  size: number
  url: string
  created_at: string
}

export class CanvasAdapter {
  constructor(private baseUrl: string) {}

  async getCourses(accessToken: string): Promise<CanvasCourse[]> {
    const response = await fetch(`${this.baseUrl}/api/v1/courses?per_page=100`, {
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Canvas API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getCourseFiles(courseId: string, accessToken: string): Promise<CanvasFile[]> {
    const response = await fetch(
      `${this.baseUrl}/api/v1/courses/${courseId}/files?per_page=100`,
      { 
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        } 
      }
    )

    if (!response.ok) {
      throw new Error(`Canvas API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async downloadFile(fileUrl: string, accessToken: string): Promise<Blob> {
    const response = await fetch(fileUrl, {
      headers: { 
        Authorization: `Bearer ${accessToken}` 
      }
    })

    if (!response.ok) {
      throw new Error(`Canvas file download error: ${response.status}`)
    }

    return response.blob()
  }

  async verifyToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/users/self`, {
        headers: { 
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      })
      return response.ok
    } catch {
      return false
    }
  }
}
