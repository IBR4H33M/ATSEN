import { useState, useEffect } from "react";
import { BookOpen, Loader, Plus, FileText, File, Link, ChevronDown, ChevronRight, Trash2, Edit, Download } from "lucide-react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import CreateMaterial from "./CreateMaterial";
import MaterialCard from "./MaterialCard";
import RoomResources from "./RoomResources";
import { useAuth } from "../../contexts/AuthContext";

const Materials = ({ roomId }) => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMaterials = async () => {
    try {
      console.log("Fetching materials for room:", roomId);
      const response = await api.get(`/materials/room/${roomId}`);
      console.log("Fetched materials:", response.data);
      setMaterials(response.data);
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast.error("Failed to fetch materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchMaterials();
    }
  }, [roomId]);

  const handleMaterialCreated = (newMaterial) => {
    setMaterials(prev => [...prev, newMaterial]);
  };

  const handleMaterialUpdated = (updatedMaterial) => {
    setMaterials(prev => 
      prev.map(material => 
        material._id === updatedMaterial._id ? updatedMaterial : material
      )
    );
  };

  const handleMaterialDeleted = (deletedId) => {
    setMaterials(prev => prev.filter(material => material._id !== deletedId));
  };

  const getSectionTitle = (section) => {
    switch (section) {
      case 'course_materials':
        return 'Course materials:';
      case 'reference_books':
        return 'Reference books:';
      case 'articles_research':
        return 'Articles/Research papers:';
      default:
        return section;
    }
  };

  const getSectionMaterials = (section) => {
    return materials.filter(material => material.section === section);
  };

  const sections = ['course_materials', 'reference_books', 'articles_research'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="animate-spin size-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Course Materials</h2>
      </div>

      <CreateMaterial 
        roomId={roomId} 
        onMaterialCreated={handleMaterialCreated}
      />

      {materials.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-base-content/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-base-content/70 mb-2">
            No materials yet
          </h3>
          <p className="text-base-content/50">
            Upload course materials, reference books, and research papers for your students!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {sections.map((section) => {
            const sectionMaterials = getSectionMaterials(section);
            if (sectionMaterials.length === 0) return null;

            return (
              <div key={section} className="space-y-4">
                <h3 className="text-lg font-bold text-base-content">
                  {getSectionTitle(section)}
                </h3>
                <div className="space-y-3">
                  {sectionMaterials.map((material) => (
                    <MaterialCard
                      key={material._id}
                      material={material}
                      onUpdate={handleMaterialUpdated}
                      onDelete={handleMaterialDeleted}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
                  {/* Resources Section */}
            <div className="mt-8 pt-8 border-t border-base-300">
              <RoomResources roomId={roomId} user={user} />
            </div>
    </div>
  );
};

export default Materials;
