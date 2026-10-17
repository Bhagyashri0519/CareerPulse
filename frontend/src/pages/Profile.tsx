import DashboardLayout from '../components/DashboardLayout';
import ProfileView from '../features/profile/ProfileView';

export default function Profile() {
  return (
    <DashboardLayout title="Student Profile">
      <div className="p-4 lg:p-6 max-w-6xl mx-auto">
        <ProfileView />
      </div>
    </DashboardLayout>
  );
}
