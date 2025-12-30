"use client"
import { useParams } from "next/navigation"
import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { useKnowledgeUpload } from "@/hooks/useKnowledgeUpload"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Plus, 
  Globe, 
  FileUp, 
  Table as TableIcon, 
  FileText, 
  AlertCircle, 
  X, 
  Upload, 
  File, 
  CheckCircle2, 
  Loader2, 
  Trash2, 
  ExternalLink,
  Book,
  Package,
  Globe as WebIcon,
  FileQuestion,
  Calendar,
  ChevronRight
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

// Type for knowledge base
interface KnowledgeBase {
  id: string
  name: string
  type: string
  indexName: string
  createdAt: string
  documents: Array<{
    id: string
    source: string
    metadata: any
    createdAt: string
  }>
}

// Type for document
interface Document {
  id: string
  source: string
  metadata: any
  createdAt: string
}

export default function KnowledgePage() {
  const params = useParams();
  const chatbotId = params.id as string;

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState("webpage")
  const [crawlSubpages, setCrawlSubpages] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadedTables, setUploadedTables] = useState<File[]>([])
  const [webpageUrl, setWebpageUrl] = useState("")
  const [sourceName, setSourceName] = useState("")
  
  // State for knowledge bases
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [kbToDelete, setKbToDelete] = useState<KnowledgeBase | null>(null)
  const [docToDelete, setDocToDelete] = useState<{ kbId: string, doc: Document } | null>(null)

  const { uploading, progress, uploadFiles, uploadWebpage, reset } = useKnowledgeUpload(chatbotId)

  // Fetch knowledge bases
  const fetchKnowledgeBases = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/chatbots/${chatbotId}/knowledge`)
      if (response.ok) {
        const data = await response.json()
        setKnowledgeBases(data)
      }
    } catch (error) {
      console.error('Failed to fetch knowledge bases:', error)
    } finally {
      setLoading(false)
    }
  }, [chatbotId])

  // Delete knowledge base
  const deleteKnowledgeBase = async (kbId: string) => {
    try {
      const response = await fetch(`/api/knowledge/${kbId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setKnowledgeBases(prev => prev.filter(kb => kb.id !== kbId))
        setDeleteDialogOpen(false)
        setKbToDelete(null)
      }
    } catch (error) {
      console.error('Failed to delete knowledge base:', error)
    }
  }

  // Delete document
  const deleteDocument = async (kbId: string, docId: string) => {
    try {
      const response = await fetch(`/api/chatbots/${chatbotId}/knowledge/${kbId}/documents/${docId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        // Update local state
        setKnowledgeBases(prev => 
          prev.map(kb => 
            kb.id === kbId 
              ? { ...kb, documents: kb.documents.filter(doc => doc.id !== docId) }
              : kb
          )
        )
        setDeleteDialogOpen(false)
        setDocToDelete(null)
      }
    } catch (error) {
      console.error('Failed to delete document:', error)
    }
  }

  useEffect(() => {
    fetchKnowledgeBases()
  }, [fetchKnowledgeBases])

  // File upload dropzone
  const onFileDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles((prev) => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps: getFileRootProps, getInputProps: getFileInputProps, isDragActive: isFileDragActive } = useDropzone({
    onDrop: onFileDrop,
    accept: {
      "text/plain": [".txt"],
      "text/csv": [".csv"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 2097152, // 2MB
  })

  // Table upload dropzone
  const onTableDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedTables((prev) => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps: getTableRootProps, getInputProps: getTableInputProps, isDragActive: isTableDragActive } = useDropzone({
    onDrop: onTableDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/plain": [".sql"],
      "application/sql": [".sql"],
    },
    maxSize: 5242880, // 5MB
  })

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const removeTable = (index: number) => {
    setUploadedTables((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    try {
      if (selectedType === 'file' && uploadedFiles.length > 0) {
        await uploadFiles(uploadedFiles, 'file', sourceName)
        setUploadedFiles([])
        setIsDialogOpen(false)
        reset()
        fetchKnowledgeBases()
      } else if (selectedType === 'table' && uploadedTables.length > 0) {
        await uploadFiles(uploadedTables, 'table', sourceName)
        setUploadedTables([])
        setIsDialogOpen(false)
        reset()
        fetchKnowledgeBases()
      } else if (selectedType === 'webpage' && webpageUrl) {
        await uploadWebpage(webpageUrl, crawlSubpages, sourceName)
        setWebpageUrl('')
        setIsDialogOpen(false)
        fetchKnowledgeBases()
      }
      setSourceName('')
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

  const canSubmit = () => {
    if (selectedType === 'file') return uploadedFiles.length > 0
    if (selectedType === 'table') return uploadedTables.length > 0
    if (selectedType === 'webpage') return webpageUrl.trim() !== ''
    return false
  }

  // Get icon for KB type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PRODUCT':
        return <Package className="w-4 h-4" />
      case 'PAGE':
        return <WebIcon className="w-4 h-4" />
      case 'FAQ':
        return <FileQuestion className="w-4 h-4" />
      case 'DOC':
        return <FileText className="w-4 h-4" />
      default:
        return <Book className="w-4 h-4" />
    }
  }

  // Get badge color for KB type
  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'PRODUCT':
        return 'default'
      case 'PAGE':
        return 'secondary'
      case 'FAQ':
        return 'outline'
      case 'DOC':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-12">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Knowledge Base</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
            Train your chatbot on knowledge that is unique to your project or business.
          </p>
        </div>

        {/* Add Knowledge Source Card */}
        <Card className="p-8 border-2 bg-linear-to-br from-primary/5 via-background to-background mb-8">
          <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Start by connecting public links, tables, and files.
          </p>
          <Button onClick={() => setIsDialogOpen(true)} size="lg" className="w-full sm:w-auto">
            <Plus className="w-5 h-5 mr-2" />
            Add Knowledge Source
          </Button>
        </Card>

        {/* Existing Knowledge Bases Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Knowledge Bases</h2>
              <p className="text-muted-foreground">
                All knowledge sources connected to your chatbot
              </p>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              {knowledgeBases.length} {knowledgeBases.length === 1 ? 'source' : 'sources'}
            </Badge>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading knowledge bases...</span>
            </div>
          ) : knowledgeBases.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-2">
              <Book className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No knowledge bases yet</h3>
              <p className="text-muted-foreground mb-6">
                Add your first knowledge source to train your chatbot
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Knowledge Source
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {knowledgeBases.map((kb) => (
                <Card key={kb.id} className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          {getTypeIcon(kb.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">{kb.name}</h3>
                            <Badge variant={getTypeBadgeVariant(kb.type)}>
                              {kb.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDistanceToNow(new Date(kb.createdAt), { addSuffix: true })}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {kb.documents.length} {kb.documents.length === 1 ? 'document' : 'documents'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Book className="w-3 h-3" />
                              {kb.indexName}
                            </span>
                          </div>
                        </div>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setKbToDelete(kb)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete knowledge base</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    {/* Documents Table */}
                    {kb.documents.length > 0 && (
                      <div className="mt-4 border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Source</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Added</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {kb.documents.map((doc) => (
                              <TableRow key={doc.id}>
                                <TableCell className="font-medium max-w-xs truncate">
                                  <div className="flex items-center gap-2">
                                    {doc.metadata?.url ? (
                                      <ExternalLink className="w-3 h-3" />
                                    ) : (
                                      <File className="w-3 h-3" />
                                    )}
                                    <span className="truncate">
                                      {doc.metadata?.fileName || doc.source}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="capitalize">
                                    {doc.metadata?.type || 'unknown'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setDocToDelete({ kbId: kb.id, doc })
                                      setDeleteDialogOpen(true)
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Knowledge Source Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">Add Knowledge Source</DialogTitle>
            <DialogDescription>
              Upload files or connect webpages to train your chatbot.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Source Name */}
            <div className="space-y-3">
              <Label htmlFor="source-name" className="text-base font-semibold">
                Source Name (Optional)
              </Label>
              <Input
                id="source-name"
                placeholder="e.g., Product Documentation"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                className="h-12"
              />
            </div>

            {/* Type Selector */}
            <div className="space-y-3">
              <Label htmlFor="type" className="text-base font-semibold">
                Source Type
              </Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger id="type" className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webpage">
                    <div className="flex items-center gap-3 py-1">
                      <Globe className="w-5 h-5" />
                      <span className="font-medium">Webpage</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="file">
                    <div className="flex items-center gap-3 py-1">
                      <FileText className="w-5 h-5" />
                      <span className="font-medium">File</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="table">
                    <div className="flex items-center gap-3 py-1">
                      <TableIcon className="w-5 h-5" />
                      <span className="font-medium">Table</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Webpage URL Input */}
            {selectedType === "webpage" && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="url" className="text-base font-semibold">
                    Website URL
                  </Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com"
                    value={webpageUrl}
                    onChange={(e) => setWebpageUrl(e.target.value)}
                    className="h-12"
                  />
                </div>
                <Card className="p-4 bg-muted/50">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="crawl-subpages"
                      checked={crawlSubpages}
                      onCheckedChange={(checked) => setCrawlSubpages(checked === true)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor="crawl-subpages" className="text-sm font-medium cursor-pointer">
                        Crawl all subpages
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Automatically discover and index all linked pages
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* File Upload */}
            {selectedType === "file" && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Upload Files</Label>
                  <div
                    {...getFileRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                      isFileDragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/50"
                    }`}
                  >
                    <input {...getFileInputProps()} />
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">
                      {isFileDragActive ? "Drop files here..." : "Drag & drop files here"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports: .txt, .csv, .pdf, .doc, .docx (Max 2MB)
                    </p>
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Selected Files ({uploadedFiles.length})</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {uploadedFiles.map((file, index) => (
                        <Card key={index} className="p-3 flex items-center gap-3 group">
                          <File className="w-5 h-5 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Table Upload */}
            {selectedType === "table" && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Upload Table Files</Label>
                  <div
                    {...getTableRootProps()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                      isTableDragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/50"
                    }`}
                  >
                    <input {...getTableInputProps()} />
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">
                      {isTableDragActive ? "Drop table files..." : "Drag & drop table files"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports: .csv, .xls, .xlsx, .sql (Max 5MB)
                    </p>
                  </div>
                </div>

                {uploadedTables.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Selected Tables ({uploadedTables.length})</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {uploadedTables.map((file, index) => (
                        <Card key={index} className="p-3 flex items-center gap-3 group">
                          <TableIcon className="w-5 h-5 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeTable(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upload Progress */}
            {uploading && progress.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Upload Progress</Label>
                {progress.map((item, idx) => (
                  <Card key={idx} className="p-3">
                    <div className="flex items-center gap-3 mb-2">
                      {item.status === 'success' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      {item.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                      {(item.status === 'uploading' || item.status === 'processing') && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      <span className="text-sm font-medium flex-1">{item.fileName}</span>
                    </div>
                    <Progress value={item.progress} className="h-2" />
                    {item.error && (
                      <p className="text-xs text-red-500 mt-1">{item.error}</p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit() || uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {kbToDelete ? 'Delete Knowledge Base' : 'Delete Document'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {kbToDelete ? (
                <>
                  Are you sure you want to delete the knowledge base <strong>"{kbToDelete.name}"</strong>? 
                  This will delete all documents in this knowledge base and cannot be undone.
                </>
              ) : (
                <>
                  Are you sure you want to delete this document? This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setKbToDelete(null)
              setDocToDelete(null)
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (kbToDelete) {
                  deleteKnowledgeBase(kbToDelete.id)
                } else if (docToDelete) {
                  deleteDocument(docToDelete.kbId, docToDelete.doc.id)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}