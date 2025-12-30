import { createContext, useContext, useState, ReactNode } from 'react'
import { Workspace } from '@/types/workspace';

interface WorkspaceContextType {
  activeWorkspace: Workspace | null
  setActiveWorkspace: (workspace: Workspace | null) => void
  workspaces: Workspace[]
  setWorkspaces: (workspaces: Workspace[]) => void
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])

  return (
    <WorkspaceContext.Provider value={{ 
      activeWorkspace, 
      setActiveWorkspace, 
      workspaces, 
      setWorkspaces 
    }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return context
}