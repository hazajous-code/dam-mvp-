import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import { useApp } from './context/AppContext'
import { canAccessMenu } from './data/roles'

import Dashboard from './pages/Dashboard'
import ProjectManagement from './pages/ProjectManagement'
import ProjectDetail from './pages/ProjectDetail'
import CreateProject from './pages/CreateProject'
import TemplateMetadata from './pages/TemplateMetadata'
import AssetUpload from './pages/AssetUpload'
import GatekeepingQA from './pages/GatekeepingQA'
import WCMQA from './pages/WCMQA'
import TransferApproval from './pages/TransferApproval'
import Analytics from './pages/Analytics'
import RuleSettings from './pages/RuleSettings'

// 메뉴 접근 권한이 없을 때 안내
function NoAccess() {
  return (
    <div className="card p-10 text-center">
      <p className="text-3xl">🔒</p>
      <h2 className="mt-3 text-lg font-bold text-slate-800">접근 권한이 없습니다</h2>
      <p className="mt-1 text-sm text-slate-500">
        현재 역할에서는 이 메뉴를 사용할 수 없습니다. 상단에서 역할을 전환해 주세요.
      </p>
    </div>
  )
}

function Guard({ menu, children }: { menu: string; children: React.ReactNode }) {
  const { role } = useApp()
  return canAccessMenu(role, menu) ? <>{children}</> : <NoAccess />
}

export default function App() {
  const location = useLocation()
  // 라우트 변경 시 스크롤 상단 이동은 main 컨테이너가 처리 (간단 데모)
  void location

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Guard menu="dashboard"><Dashboard /></Guard>} />
        <Route path="/projects" element={<Guard menu="projects"><ProjectManagement /></Guard>} />
        <Route path="/projects/:id" element={<Guard menu="projects"><ProjectDetail /></Guard>} />
        <Route path="/create" element={<Guard menu="create"><CreateProject /></Guard>} />
        <Route path="/template" element={<Guard menu="template"><TemplateMetadata /></Guard>} />
        <Route path="/upload" element={<Guard menu="upload"><AssetUpload /></Guard>} />
        <Route path="/upload/:id" element={<Guard menu="upload"><AssetUpload /></Guard>} />
        <Route path="/gatekeeping" element={<Guard menu="gatekeeping"><GatekeepingQA /></Guard>} />
        <Route path="/gatekeeping/:id" element={<Guard menu="gatekeeping"><GatekeepingQA /></Guard>} />
        <Route path="/wcm" element={<Guard menu="wcm"><WCMQA /></Guard>} />
        <Route path="/wcm/:id" element={<Guard menu="wcm"><WCMQA /></Guard>} />
        <Route path="/transfer" element={<Guard menu="transfer"><TransferApproval /></Guard>} />
        <Route path="/transfer/:id" element={<Guard menu="transfer"><TransferApproval /></Guard>} />
        <Route path="/analytics" element={<Guard menu="analytics"><Analytics /></Guard>} />
        <Route path="/rules" element={<Guard menu="rules"><RuleSettings /></Guard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
