export interface ApplicationSubmittedEmailData {
  studentName: string;
  internshipTitle: string;
  companyName: string;
}

export interface ApplicationStatusUpdatedEmailData {
  studentName: string;
  internshipTitle: string;
  companyName: string;
  newStatus: string;
  note?: string;
}

function baseLayout(title: string, bodyHtml: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1f2937;">
      <h2 style="color: #2563eb; margin: 0 0 16px;">${title}</h2>
      ${bodyHtml}
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="font-size: 12px; color: #9ca3af;">
        You are receiving this email because you have an account on Internly.
      </p>
    </div>
  `;
}

export function applicationSubmittedTemplate(
  data: ApplicationSubmittedEmailData,
): string {
  return baseLayout(
    'Application Submitted',
    `
    <p>Hi ${data.studentName},</p>
    <p>Your application for <strong>${data.internshipTitle}</strong>
       at <strong>${data.companyName}</strong> was submitted successfully.</p>
    <p>You can track its status from your Internly dashboard.</p>
    `,
  );
}

export function applicationStatusUpdatedTemplate(
  data: ApplicationStatusUpdatedEmailData,
): string {
  return baseLayout(
    'Application Status Updated',
    `
    <p>Hi ${data.studentName},</p>
    <p>The status of your application for <strong>${data.internshipTitle}</strong>
       at <strong>${data.companyName}</strong> changed to
       <strong>${data.newStatus}</strong>.</p>
    ${data.note ? `<p><em>Recruiter note: ${data.note}</em></p>` : ''}
    `,
  );
}
