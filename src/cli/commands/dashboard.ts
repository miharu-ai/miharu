import { startDashboard } from '../../dashboard/server';

export async function dashboardCommand(): Promise<void> {
  await startDashboard();
}