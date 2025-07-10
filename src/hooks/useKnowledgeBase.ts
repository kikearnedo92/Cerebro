
import { useKnowledgeBaseData } from './knowledge/useKnowledgeBaseData'
import { useKnowledgeBaseSearch } from './knowledge/useKnowledgeBaseSearch'
import { useKnowledgeBaseItems } from './knowledge/useKnowledgeBaseItems'
import { useKnowledgeBaseUpload } from './knowledge/useKnowledgeBaseUpload'

export const useKnowledgeBase = () => {
  const { items, setItems, isLoading, error, fetchItems } = useKnowledgeBaseData()
  const { searchKnowledgeBase, searchForContext, getKnowledgeBaseStats, isSearching, searchResults, searchStats } = useKnowledgeBaseSearch()
  const { addItem, updateItem, toggleActive, deleteItem, syncDocuments } = useKnowledgeBaseItems(items, setItems)
  const { isUploading, uploadFile } = useKnowledgeBaseUpload(setItems)

  return {
    items,
    isLoading,
    isUploading,
    isSearching,
    error,
    searchResults,
    searchStats,
    fetchItems,
    searchKnowledgeBase,
    searchForContext,
    getKnowledgeBaseStats,
    addItem,
    updateItem,
    toggleActive,
    uploadFile,
    deleteItem,
    syncDocuments
  }
}
