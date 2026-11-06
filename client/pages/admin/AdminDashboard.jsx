<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title=\"Approved Assessments\"  value={stats?.totalAssessments}   icon={ClipboardList} color=\"green\" />
        <StatCard title=\"Pending Assessments\"   value={stats?.assessmentsPending} icon={ClipboardList} color=\"yellow\" />
        <StatCard title=\"Classroom Records\"     value={stats?.classroomPerformances ?? 0} icon={BookOpen} color=\"blue\" />
        <StatCard title=\"Gallery Pending\"       value={stats?.galleryPending}     icon={Image}         color=\"purple\" />
        <StatCard title=\"Active Competitions\"   value={stats?.upcomingComps}      icon={Trophy}        color=\"red\" />