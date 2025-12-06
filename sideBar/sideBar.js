function setupSidebar() {
    const sidebarContainer = document.getElementById('sidebar-container');

    // Only run this script if the sidebar container exists on the page
    if (sidebarContainer) {
        // If sidebar is already there, no need to fetch again. Just init.
        if (sidebarContainer.querySelector('#calc-menu')) {
            initializeSidebar();
        } else {
            fetch('sideBar/sideBar.html')
                .then(response => response.text())
                .then(html => {
                    sidebarContainer.innerHTML = html;
                    initializeSidebar();
                });
        }
    }

    function initializeSidebar() {
        const menuLinks = document.querySelectorAll('#calc-menu .sidebar-link');
        const panels = document.querySelectorAll('.calculator-panel');

        function showPanel(targetId) {
            // Hide all panels
            panels.forEach(panel => {
                panel.style.display = 'none';
            });

            // Show the target panel
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.style.display = 'block';
            }

            // Update active class on menu links
            menuLinks.forEach(link => {
                if (link.getAttribute('data-target') === targetId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }

        menuLinks.forEach(link => {
            // To prevent attaching multiple listeners, remove any existing one.
            link.replaceWith(link.cloneNode(true));
        });

        // Re-query the links to get the new nodes
        const newMenuLinks = document.querySelectorAll('#calc-menu .sidebar-link');
        newMenuLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('data-target');
                showPanel(targetId);
            });
        });

        // Show the first panel by default
        if (newMenuLinks.length > 0) {
            const defaultTarget = newMenuLinks[0].getAttribute('data-target');
            showPanel(defaultTarget);
        }
    }
}