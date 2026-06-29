export function renderRecommendations(container, recs = [], aiExplanation = "") {

  container.innerHTML = `
        <div class="section-title">
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="16"
                 height="16"
                 viewBox="0 0 24 24"
                 fill="none"
                 stroke="currentColor"
                 stroke-width="2">

                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>

            </svg>

            Recommendations
        </div>

        <div class="rec-list">

            ${recs.length
      ? recs.map(r => `
                    <div class="rec-item">

                        <span class="rec-check">✔</span>

                        <span>${r.action}</span>

                    </div>
                `).join("")
      : `
                    <div class="empty-recommendations">

                        No recommendations available.

                    </div>
                `
    }

        </div>

        ${aiExplanation
      ? `
                <div class="ai-explanation-card">

                    <button
                        class="ai-explanation-toggle"
                        type="button">

                        <span>AI Explanation</span>

                        <span class="ai-arrow">▼</span>

                    </button>

                    <div class="ai-explanation-content">

                        <p>${aiExplanation}</p>

                    </div>

                </div>
            `
      : ""
    }
    `;

  const toggle = container.querySelector(".ai-explanation-toggle");

  if (toggle) {

    const content = container.querySelector(".ai-explanation-content");
    const arrow = container.querySelector(".ai-arrow");

    content.style.display = "none";

    toggle.addEventListener("click", () => {

      const open = content.style.display === "block";

      content.style.display = open ? "none" : "block";

      arrow.textContent = open ? "▼" : "▲";

    });

  }

}