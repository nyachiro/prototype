import { Claim } from "@/types";

// Simple text similarity function using Jaccard similarity
function calculateJaccardSimilarity(text1: string, text2: string): number {
  const normalize = (text: string) => 
    text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2);

  const words1 = new Set(normalize(text1));
  const words2 = new Set(normalize(text2));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

// Find similar claims with a threshold
export function findSimilarClaims(newClaim: string, existingClaims: Claim[], threshold = 0.6): Claim[] {
  return existingClaims.filter(claim => {
    const similarity = calculateJaccardSimilarity(newClaim, claim.content);
    return similarity >= threshold;
  });
}

// Group claims by similarity
export function groupSimilarClaims(claims: Claim[], threshold = 0.6): Claim[][] {
  const groups: Claim[][] = [];
  const processed = new Set<string>();

  for (const claim of claims) {
    if (processed.has(claim.id)) continue;

    const similarClaims = [claim];
    processed.add(claim.id);

    for (const otherClaim of claims) {
      if (processed.has(otherClaim.id)) continue;
      
      const similarity = calculateJaccardSimilarity(claim.content, otherClaim.content);
      if (similarity >= threshold) {
        similarClaims.push(otherClaim);
        processed.add(otherClaim.id);
      }
    }

    groups.push(similarClaims);
  }

  return groups;
}

// Update a claim and mark similar ones as duplicates
export function updateClaimWithDuplicates(
  primaryClaimId: string, 
  claims: Claim[], 
  updateData: Partial<Claim>
): Claim[] {
  const primaryClaim = claims.find(c => c.id === primaryClaimId);
  if (!primaryClaim) return claims;

  const similarClaims = findSimilarClaims(primaryClaim.content, claims);
  
  return claims.map(claim => {
    if (claim.id === primaryClaimId) {
      return { ...claim, ...updateData };
    } else if (similarClaims.some(sc => sc.id === claim.id)) {
      return { 
        ...claim, 
        status: updateData.status || claim.status,
        verdict: updateData.verdict || claim.verdict,
        explanation: updateData.explanation || claim.explanation,
        references: updateData.references || claim.references,
        duplicateOf: primaryClaimId,
        approved: updateData.approved ?? claim.approved
      };
    }
    return claim;
  });
}