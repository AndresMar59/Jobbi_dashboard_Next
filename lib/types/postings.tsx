

export interface PostingResponse {
  data: PostingData[];
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
}

export interface PostingData {
  posting_id: string;
  company_id: string;
  company_name: string;
  posting_title: string;
  posting_status: string;
  posting_created_at: string;
  metrics: PostingMetrics;
}

export interface PostingMetrics {
  candidates_applied: {
    total_applications: number;
    status_distribution: Array<{ count: number; status: string; percentage: number }>;
    applications_in_range: number;
  };
  top_candidates_five: Array<{
    first_name: string;
    last_names: string;
    picture_url: string | null;
    user_account_id: string;
    match_percentage: number;
  }>;
  pipeline_candidate_status: Array<{
    stage_id: string;
    stage_name: string;
    stage_type: string;
    total_count: number;
    percentage: number;
  }>;
  average_matching_percentage: {
    average_percentage: number;
    change_this_month: number;
  };
}