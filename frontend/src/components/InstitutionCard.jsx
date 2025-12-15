import { useState } from "react";
import { Building, FileText, MapPin, HelpCircle } from "lucide-react";
import DocumentRequestForm from "./DocumentRequestForm";
import SupportDeskForm from "./SupportDeskForm";
import { useAuth } from "../contexts/AuthContext";

const InstitutionCard = ({ institution, onRequestSuccess }) => {
  const { user } = useAuth();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showSupportForm, setShowSupportForm] = useState(false);

  return (
    <>
      <div className="card bg-base-100 border border-base-300 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <Building className="h-10 w-10 text-primary" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-base-content">
                {institution.name}
              </h3>
              {institution.eiin && (
                <p className="text-sm text-base-content/60">
                  EIIN: {institution.eiin}
                </p>
              )}
            </div>
          </div>
        </div>

        {institution.address && (
          <div className="flex items-center text-sm text-base-content/60 mb-3">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{institution.address}</span>
          </div>
        )}

        {institution.description && (
          <p className="text-base-content/70 text-sm mb-4 line-clamp-2">
            {institution.description}
          </p>
        )}

        <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
                {institution.superadminEmail && (
                  <span>{institution.superadminEmail}</span>
                )}
              </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowRequestForm(true)}
              className="flex-1 flex items-center justify-center px-3 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors text-sm font-medium"
            >
              <FileText className="h-4 w-4 mr-2" />
              Request Document
            </button>
            
            <button
              onClick={() => setShowSupportForm(true)}
              className="flex-1 flex items-center justify-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Contact Support
            </button>
          </div>
        </div>
      </div>

      <DocumentRequestForm
        institution={institution}
        isOpen={showRequestForm}
        onClose={() => setShowRequestForm(false)}
        onSuccess={onRequestSuccess}
      />
      
      <SupportDeskForm
        institution={institution}
        isOpen={showSupportForm}
        onClose={() => setShowSupportForm(false)}
        onSuccess={() => setShowSupportForm(false)}
        student={user}
      />
    </>
  );
};

export default InstitutionCard;
